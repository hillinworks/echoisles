import { PreciseDuration } from "./PreciseDuration";


export enum BaseNoteValue {
    Large = 3,
    Long = 2,
    Double = 1,
    Whole = 0,
    Half = -1,
    Quater = -2,
    Eighth = -3,
    Sixteenth = -4,
    ThirtySecond = -5,
    SixtyFourth = -6,
    HundredTwentyEighth = -7,
    TwoHundredFiftySixth = -8
}

export module BaseNoteValue {

    export function getDuration(value: BaseNoteValue): PreciseDuration {
        return PreciseDuration.fromDuration(Math.pow(2, value));
    }

    export function getInvertedDuration(value: BaseNoteValue): number {
        if (value > 0)
            throw new RangeError("only whole or shorter values are supported");

        return Math.pow(2, -value);
    }

    export function half(value: BaseNoteValue): BaseNoteValue {
        if (getIsShortestSupported(value))
            throw new RangeError();

        return value - 1;
    }

    export function double(value: BaseNoteValue): BaseNoteValue {
        if (getIsLongestSupported(value))
            throw new RangeError();

        return value + 1;
    }

    export function getIsShortestSupported(value: BaseNoteValue): boolean {
        return value === BaseNoteValue.TwoHundredFiftySixth;
    }

    export function getIsLongestSupported(value: BaseNoteValue): boolean {
        return value === BaseNoteValue.Large;
    }

    export function parse(reciprocalValue: number): BaseNoteValue | undefined {
        switch (reciprocalValue) {
            case 1:
                return BaseNoteValue.Whole;
            case 2:
                return BaseNoteValue.Half;
            case 4:
                return BaseNoteValue.Quater;
            case 8:
                return BaseNoteValue.Eighth;
            case 16:
                return BaseNoteValue.Sixteenth;
            case 32:
                return BaseNoteValue.ThirtySecond;
            case 64:
                return BaseNoteValue.SixtyFourth;
            case 128:
                return BaseNoteValue.HundredTwentyEighth;
            case 256:
                return BaseNoteValue.TwoHundredFiftySixth;
            default:
                return undefined;
        }
    }

    export function factorize(duration: PreciseDuration): BaseNoteValue[] | undefined {
        const values = new Array<BaseNoteValue>();
        let currentNoteValue = BaseNoteValue.Large;
        let currentDuration = getDuration(currentNoteValue);
        while (currentNoteValue >= BaseNoteValue.TwoHundredFiftySixth) {
            if (duration < currentDuration) {
                --currentNoteValue;
                currentDuration = getDuration(currentNoteValue);
                continue;
            }

            values.push(currentNoteValue);
            duration = duration.minus(currentDuration);
        }

        return duration.equals(0) ? values : undefined;
    }
}