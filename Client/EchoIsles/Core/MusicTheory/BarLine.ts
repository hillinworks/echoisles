export enum BarLine {
    Standard = 0,
    Double = 1,
    End = 2,
    BeginRepeat = 3,
    EndRepeat = 4,
    BeginAndEndRepeat = 5,
    BeginRepeatAndEnd = 6,
}

export module BarLine {
    export type OpenType = BarLine.Standard | BarLine.BeginRepeat;
    export type CloseType = BarLine.Standard | BarLine.Double | BarLine.End | BarLine.EndRepeat;

    export function toBarLine(barLine: OpenType | CloseType): BarLine {
        return barLine as BarLine;
    }
}