import { Element } from "./Element";
import { NoteEffectTechnique } from "../MusicTheory/NoteEffectTechnique";
import { NoteAccent } from "../MusicTheory/NoteAccent";
import { NoteConnection } from "../MusicTheory/String/NoteConnection";
import { VerticalDirection } from "../Style/VerticalDirection";
import { Beat } from "./Beat";
import { IChordFingering } from "./Tablature/IChordFingering";

export class BeatNote extends Element {
    static readonly unspecifiedFret = -1;

    string: number;
    fret: number;

    effectTechnique = NoteEffectTechnique.None;
    accent = NoteAccent.Normal;
    effectTechniqueParameter?: number;  // todo:refactor
    preConnection: NoteConnection.PreNoteType = NoteConnection.None;
    postConnection: NoteConnection.PostNoteType = NoteConnection.None;

    /**
     * The note to which this note is pre-connected to, if this note has a valid PreConnection
     */
    preConnectedNote: BeatNote;

    /**
     * The note to which this note is post-connected to, if this note has any note pre-connected to it
     */
    postConnectedNote: BeatNote;

    isTied: boolean;
    tiePosition?: VerticalDirection;

    ownerBeat: Beat;

    get isHarmonics(): boolean {
        return this.effectTechnique === NoteEffectTechnique.ArtificialHarmonic
            || this.effectTechnique === NoteEffectTechnique.NaturalHarmonic;
    }

    clearRange(): void {
        this.range = undefined;
    }

    clone(): BeatNote {
        const clone = new BeatNote();
        clone.string = this.string;
        clone.fret = this.fret;
        clone.effectTechnique = this.effectTechnique;
        clone.accent = this.accent;
        clone.effectTechniqueParameter = this.effectTechniqueParameter;
        clone.preConnection = this.preConnection;
        clone.postConnection = this.postConnection;
        clone.preConnectedNote = this.preConnectedNote;
        clone.postConnectedNote = this.postConnectedNote;
        clone.isTied = this.isTied;
        clone.tiePosition = this.tiePosition;
        clone.ownerBeat = this.ownerBeat;

        return clone;
    }

    matchesChord(chord: IChordFingering): boolean {
        return chord.notes !== undefined
            && chord.notes[this.string] !== undefined
            && chord.notes[this.string].fret === this.fret;
    }
}