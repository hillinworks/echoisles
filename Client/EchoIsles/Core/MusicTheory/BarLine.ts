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

    export function merge(close?: CloseType, open?: OpenType): BarLine {
        switch (open) {
            case undefined:
            case BarLine.Standard:
                return close === undefined ? BarLine.Standard : close;

            case BarLine.BeginRepeat:
                switch (close) {
                    case undefined:
                        return BarLine.BeginRepeat;
                    case BarLine.Standard:
                        return BarLine.BeginRepeat;
                    case BarLine.Double:
                        return BarLine.BeginRepeat;
                    case BarLine.End:
                        return BarLine.BeginRepeatAndEnd;
                    case BarLine.EndRepeat:
                        return BarLine.BeginAndEndRepeat;
                    default:
                        throw new Error();  // should not reach here
                }

            default:
                throw new Error();  // should not reach here
        }
    }
}