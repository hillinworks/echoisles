import { BaseNoteValue } from "./BaseNoteValue";
import { PreciseDuration } from "./PreciseDuration";

export class Time {

    readonly beats: number;
    readonly noteValue: BaseNoteValue;

    constructor(beats: number, noteValue: BaseNoteValue) {
        this.beats = beats;
        this.noteValue = noteValue;
    }

    get duration(): PreciseDuration {
        return BaseNoteValue.getDuration(this.noteValue).multiply(this.beats);
    }

    equals(other: Time): boolean {
        return other && this.beats === other.beats && this.noteValue === other.noteValue;
    }
}

export module Time {
    // ReSharper disable InconsistentNaming
    export const T22 = new Time(2, BaseNoteValue.Half);
    export const T44 = new Time(4, BaseNoteValue.Quater);
    export const T34 = new Time(3, BaseNoteValue.Quater);
    export const T24 = new Time(2, BaseNoteValue.Quater);
    export const T68 = new Time(6, BaseNoteValue.Eighth);
    // ReSharper restore InconsistentNaming
}