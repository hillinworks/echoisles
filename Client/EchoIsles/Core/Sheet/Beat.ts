import { Element } from "./Element"
import { NoteValue } from "../MusicTheory/NoteValue";
import { BeatNote } from "./BeatNote";
import { StrumTechnique } from "../MusicTheory/String/Plucked/StrumTechnique";
import { Ornament } from "../MusicTheory/Ornament";
import { NoteRepetition } from "../MusicTheory/NoteRepetition";
import { HoldAndPause } from "../MusicTheory/HoldAndPause";
import { BeatAccent } from "../MusicTheory/BeatAccent";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";
DocumentRow.Child
import { Beam } from "./Beam";
import { IBeatElementContainer } from "./IBeatElementContainer";
import { Bar } from "./Bar";
import { VoicePart } from "./VoicePart";
import { NoteConnection } from "../MusicTheory/String/NoteConnection";
import { VerticalDirection } from "../Style/VerticalDirection";

export class Beat extends Element {
    noteValue: NoteValue;
    readonly notes = new Array<BeatNote>();
    isRest: boolean;
    isTied: boolean;
    strumTechnique = StrumTechnique.None;
    ornament = Ornament.None;
    noteRepetition = NoteRepetition.None;
    effectTechniqueParameter?: number; //todo: refactor
    holdAndPause = HoldAndPause.None;
    accent = BeatAccent.Normal;

    previousBeat: Beat;
    nextBeat: Beat;

    position: PreciseDuration;
    ownerColumn: BarColumn;
    private _beatElementOwner: IBeatElementContainer;

    voicePart: VoicePart;

    preConnection: NoteConnection.PreBeatType = NoteConnection.None;
    postConnection: NoteConnection.PostBeatType = NoteConnection.None;
    tiePosition?: VerticalDirection;

    isForceBeamStart: boolean;
    isForceBeamEnd: boolean;

    get hasChordStrumTechnique(): boolean {
        return StrumTechnique.isChordType(this.strumTechnique);
    }

    get beatElementOwner(): IBeatElementContainer {
        return this._beatElementOwner;
    }

    get ownerBeam(): Beam {
        return this.beatElementOwner as Beam;
    }

    get ownerBar(): Bar {
        return this.beatElementOwner.ownerBar;
    }

    /**
     * Get the beat to which this beat is tied. If this beat is not tied, the value is null.
     */
    get tieHead(): Beat | undefined {
        if (!this.isTied)
            return undefined;

        return this.previousBeat.isTied ? this.previousBeat.tieHead : this.previousBeat;
    }

    /**
     * Get the beat which defines the nodes for this beat. As in, if this beat is tied,
     * the tie head will be the notes definer
     */
    get notesDefiner(): Beat {
        return this.isTied ? this.tieHead! : this;
    }

    get duration(): PreciseDuration {
        return this.noteValue.duration;
    }

    clearRange(): void {
        this.range = undefined;
        if (this.notes)
            this.notes.forEach(n => n.clearRange());
    }

    clone(): Beat {
        const clone = new Beat();
        clone.range = this.range;

        clone.noteValue = this.noteValue;
        clone.isRest = this.isRest;
        clone.isTied = this.isTied;
        clone.preConnection = this.preConnection;
        clone.tiePosition = this.tiePosition;
        clone.postConnection = this.postConnection;
        clone.strumTechnique = this.strumTechnique;
        clone.ornament = this.ornament;
        clone.noteRepetition = this.noteRepetition;
        clone.effectTechniqueParameter = this.effectTechniqueParameter;
        clone.holdAndPause = this.holdAndPause;
        clone.accent = this.accent;
        this.notes.forEach(n => clone.notes.push(n.clone()));
        clone._beatElementOwner = this._beatElementOwner;
        clone.voicePart = this.voicePart;

        return clone;
    }

    setOwner(owner: IBeatElementContainer): void {
        this._beatElementOwner = owner;
    }
}