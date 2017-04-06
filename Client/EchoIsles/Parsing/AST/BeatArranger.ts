import { VoicePart } from "../../Core/Sheet/VoicePart";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Voice } from "../../Core/Sheet/Voice";
import { Beam } from "../../Core/Sheet/Beam";
import { IBeatElement } from "../../Core/Sheet/IBeatElement";
import { PreciseDuration } from "../../Core/MusicTheory/PreciseDuration";
import { IInternalBeatElement } from "../../Core/Sheet/IInternalBeatElement";
import { Beat } from "../../Core/Sheet/Beat";
import { assert } from "../../Core/Utilities/Debug";

function rearrangeBeam(beam: Beam): IBeatElement[] {
    const headRests = new Array<IBeatElement>();
    let indexOfFirstNonResetBeat = 0;
    for (let i = indexOfFirstNonResetBeat; i < beam.elements.length; ++i) {
        const element = beam.elements[i];
        if (!(element instanceof Beat))
            break;

        const beat = element as Beat;
        if (!beat.isRest)
            break;

        headRests.push(beat);
        indexOfFirstNonResetBeat = i + 1;
    }

    const tailRests = new Array<IBeatElement>();
    let indexOfLastNonRestBeat = beam.elements.length - 1;
    for (let i = indexOfLastNonRestBeat; i > indexOfFirstNonResetBeat; --i) {
        const element = beam.elements[i];
        if (!(element instanceof Beat))
            break;

        const beat = element as Beat;
        if (!beat.isRest)
            break;

        tailRests.push(beat);
        indexOfLastNonRestBeat = i - 1;
    }

    beam.elements.splice(indexOfLastNonRestBeat + 1, beam.elements.length - indexOfLastNonRestBeat - 1);
    beam.elements.splice(0, indexOfFirstNonResetBeat);

    const result = headRests;

    if (beam.elements.length === 1 && beam.elements[0] instanceof Beat) {
        result.push(beam.elements[0]);
    } else if (beam.elements.length > 0) {
        result.push(beam);
    }

    result.push(...tailRests);

    return result;
}

export class BeatArranger {

    private readonly beamNoteValue: BaseNoteValue;
    private readonly ownerVoice: Voice;
    private readonly beamStack = new Array<Beam>();
    private readonly rootBeats = new Array<IBeatElement>();
    private currentBeam?: Beam;
    private currentCapacity = PreciseDuration.zero;
    private duration = PreciseDuration.zero;

    constructor(beamNoteValue: BaseNoteValue, ownerVoice: Voice) {
        this.beamNoteValue = beamNoteValue;
        this.ownerVoice = ownerVoice;
    }

    get voicePart(): VoicePart {
        return this.ownerVoice.voicePart;
    }

    finish(): void {
        this.finishBeamStack();

        for (let beat of this.rootBeats) {
            (beat as IInternalBeatElement).setOwner(this.ownerVoice);
            this.ownerVoice.elements.push(beat);
        }
    }

    private finishBeam(): void {
        const poppedBeam = this.beamStack.pop();

        if (!poppedBeam) {
            throw new Error("cannot finish beam on an empty beam stack");
        }

        this.currentBeam = this.beamStack.length > 0 ? this.beamStack[this.beamStack.length - 1] : undefined;

        if (poppedBeam.elements.length === 0) {
            this.rootBeats.splice(this.rootBeats.indexOf(poppedBeam), 1);
            return;
        }

        const rearrangedElements = rearrangeBeam(poppedBeam);

        // if the rearrangement didn't change the beam
        if (rearrangedElements.length === 1 && rearrangedElements[0] === poppedBeam)
            return;

        if (this.currentBeam === undefined) { // root
            this.rootBeats.pop();
            this.rootBeats.push(...rearrangedElements);
        } else {
            this.currentBeam.elements.pop();
            this.currentBeam.elements.push(...rearrangedElements);

            for (let element of rearrangedElements) {
                if (element instanceof Beat) {
                    (element as IInternalBeatElement).setOwner(this.currentBeam);
                }
            }
        }
    }

    addBeat(beat: Beat): void {
        if (beat.noteValue.base >= this.beamNoteValue) { // beat too long to be beamed
            this.insertUnbeamedBeat(beat);
            return;
        }

        const tuplet = beat.noteValue.tuplet;

        if (this.currentBeam !== undefined && this.currentBeam.isTupletFull) { // tuplet full
            this.finishBeam();
        }

        if (this.currentBeam === undefined) { // initialize root beam
            this.startRootBeam(tuplet);
        } else if (this.duration >= this.currentCapacity) { // beam full
            this.finishAndStartRootBeam(tuplet);
        } else if (!this.currentBeam.matchesTuplet(beat)) { // tuplet mismatch
            this.finishAndStartRootBeam(tuplet);
        }

        let beatNoteValue = beat.noteValue.base;

        if (!this.currentBeam) {
            throw new Error("currentBeam is undefined");
        }

        while (beatNoteValue > this.currentBeam.beatNoteValue) {
            assert(this.beamStack.length > 0);
            this.finishBeam();
        }

        // create sub-beams if beat is too short
        while (beatNoteValue < this.currentBeam.beatNoteValue) {
            this.startChildBeam(tuplet);
        }

        assert(beatNoteValue === this.currentBeam.beatNoteValue);
        this.addToCurrentBeam(beat);
    }

    private insertUnbeamedBeat(beat: Beat): void {
        this.finishBeamStack();
        this.rootBeats.push(beat);
        this.duration = this.duration.add(beat.duration);
    }

    private addToCurrentBeam(beat: Beat): void {
        if (!this.currentBeam) {
            throw new Error("currentBeam is undefined");
        }

        this.currentBeam.elements.push(beat);
        (beat as IInternalBeatElement).setOwner(this.currentBeam);
        this.duration = this.duration.add(beat.duration);
    }

    private finishAndStartRootBeam(tuplet?: number): void {
        this.finishBeamStack();
        this.startRootBeam(tuplet);
    }

    private startChildBeam(tuplet?: number): void {
        if (!this.currentBeam) {
            throw new Error("currentBeam is undefined");
        }

        const newBeam = new Beam(BaseNoteValue.half(this.currentBeam.beatNoteValue), this.ownerVoice, this.currentBeam);
        newBeam.tuplet = tuplet;
        this.beamStack.push(newBeam);
        this.currentBeam.elements.push(newBeam);
        this.currentBeam = newBeam;
    }

    private startRootBeam(tuplet?: number): void {
        if (this.currentBeam) {
            throw new Error("currentBeam is not undefined");
        }

        this.currentBeam = new Beam(BaseNoteValue.half(this.beamNoteValue), this.ownerVoice);
        this.rootBeats.push(this.currentBeam);
        this.beamStack.push(this.currentBeam);

        while (this.currentCapacity <= this.duration) {
            this.currentCapacity = this.currentCapacity.add(BaseNoteValue.getDuration(this.beamNoteValue));
        }
    }

    private finishBeamStack(): void {
        while (this.beamStack.length > 0) {
            this.finishBeam();
        }
    }
} 
