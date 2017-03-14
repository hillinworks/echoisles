import { BaseNoteValue } from "./BaseNoteValue";

export class Tempo {
    readonly noteValue: BaseNoteValue;
    readonly beats: number;

    constructor(beats: number, noteValue: BaseNoteValue = BaseNoteValue.Quater) {
        this.beats = beats;
        this.noteValue = noteValue;
    }
}
