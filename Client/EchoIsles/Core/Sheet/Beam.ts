import { VirtualElement } from "./VirtualElement";
import { BaseNoteValue } from "../MusicTheory/BaseNoteValue";
import { VoicePart } from "./VoicePart";
import { Bar } from "./Bar";
import { Voice } from "./Voice";
import { IInternalBeatElement } from "./IInternalBeatElement";
import { IBeatElementContainer } from "./IBeatElementContainer";
import { IBeatElement } from "./IBeatElement";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";
import { Beat } from "./Beat";
import { StringBuilder } from "../Utilities/StringBuilder";

export class Beam extends VirtualElement implements IInternalBeatElement, IBeatElementContainer {
    beatNoteValue: BaseNoteValue;
    readonly ownerVoice: Voice;
    readonly isRoot: boolean;
    readonly elements = new Array<IBeatElement>();
    tuplet?: number;
    private _beatElementOwner?: IBeatElementContainer;

    constructor(beatNoteValue: BaseNoteValue, ownerVoice: Voice, owner?: Beam) {
        super();
        this.beatNoteValue = beatNoteValue;
        this.ownerVoice = ownerVoice;
        this.isRoot = owner === undefined;
        this._beatElementOwner = owner;
    }

    get voicePart(): VoicePart {
        return this.ownerVoice.voicePart;
    }

    get ownerBar(): Bar {
        return this.ownerVoice.ownerBar;
    }

    get rootBeam(): Beam | undefined {
        return this.isRoot ? this : this.ownerBeam === undefined ? undefined : this.ownerBeam.rootBeam;
    }

    get ownerBeam(): Beam | undefined {
        return this.beatElementOwner instanceof Beam ? this.beatElementOwner as Beam : undefined;
    }

    get beatElementOwner(): IBeatElementContainer | undefined {
        return this._beatElementOwner;
    }

    get duration(): PreciseDuration {
        return PreciseDuration.sum(this.elements, e => e.duration);
    }

    clearRange(): void {
        this.elements.forEach(e => e.clearRange());
    }

    setOwner(owner: IBeatElementContainer): void {
        this._beatElementOwner = owner;
    }

    clone(): Beam {
        const clone = new Beam(this.beatNoteValue, this.ownerVoice);
        clone.tuplet = this.tuplet;

        this.elements.forEach(e => {
            const clonedElement = (e as IInternalBeatElement).clone();
            clonedElement.setOwner(clone);
            clone.elements.push(clonedElement);
        });

        return clone;
    }

    get isTupletFull(): boolean {
        if (this.tuplet === undefined) {
            return false;
        }

        return BaseNoteValue.getDuration(this.beatNoteValue).multiply(this.tuplet / 2) <= this.duration;
    }

    matchesTuplet(beat: Beat): boolean {
        return this.beatNoteValue > beat.noteValue.base // if we are large enough to create a child beam for this beat
            || this.tuplet === beat.noteValue.tuplet;   // or our tuplet exactly matches
    }

    toString(): string {
        const builder = new StringBuilder();
        builder.append("Beam of")
            .append(BaseNoteValue[this.beatNoteValue]);

        if (this.tuplet !== undefined) {
            builder.append("/")
                .append(this.tuplet);
        }

        builder.append("(").append(this.duration).append(")");

        return builder.toString();
    }
}