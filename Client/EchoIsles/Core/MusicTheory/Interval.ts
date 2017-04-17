import { IntervalQuality } from "./IntervalQuality";

export class Interval {

    readonly number: number;
    readonly quality: IntervalQuality;

    constructor(number: number, quality: IntervalQuality) {
        if (!Interval.isValid(number, quality))
            throw new RangeError("number and quality mismatch");

        this.number = number;
        this.quality = quality;
    }

    get octaves(): number {
        return this.number / 7;
    }

    get normalizedNumber(): number {
        return this.number % 7;
    }

    get couldBePerfect(): boolean {
        const normalizedNumber = this.normalizedNumber;
        return normalizedNumber === 0 || normalizedNumber === 3 || normalizedNumber === 4;
    }

    get semitoneOffset() {
        let baseValue: number;
        const normalizedNumber = this.normalizedNumber;
        switch (normalizedNumber) {
            case 0: baseValue = 0; break;
            case 1: baseValue = 1; break;
            case 2: baseValue = 3; break;
            case 3: baseValue = 5; break;
            case 4: baseValue = 7; break;
            case 5: baseValue = 8; break;
            case 6: baseValue = 10; break;
            default:
                throw new RangeError();
        }

        switch (this.quality) {
            case IntervalQuality.Major:
                baseValue += 1; break;
            case IntervalQuality.Augmented:
                if (this.couldBePerfect)
                    baseValue += 1;
                else
                    baseValue += 2;
                break;
            case IntervalQuality.Diminished:
                baseValue -= 1; break;
        }

        return this.octaves * 12 + baseValue;
    }

    equals(other: Interval): boolean {
        return other && this.number === other.number && this.quality === other.quality;
    }

    // todo: implement toString
}

export module Interval {

    // ReSharper disable InconsistentNaming
    export const P1 = new Interval(0, IntervalQuality.Perfect);
    export const m2 = new Interval(1, IntervalQuality.Minor);
    export const M2 = new Interval(1, IntervalQuality.Major);
    export const m3 = new Interval(2, IntervalQuality.Minor);
    export const M3 = new Interval(2, IntervalQuality.Major);
    export const P4 = new Interval(3, IntervalQuality.Perfect);
    export const P5 = new Interval(4, IntervalQuality.Perfect);
    export const m6 = new Interval(5, IntervalQuality.Minor);
    export const M6 = new Interval(5, IntervalQuality.Major);
    export const m7 = new Interval(6, IntervalQuality.Minor);
    export const M7 = new Interval(6, IntervalQuality.Major);
    export const P8 = new Interval(7, IntervalQuality.Perfect);
    export const m9 = new Interval(8, IntervalQuality.Minor);
    export const M9 = new Interval(8, IntervalQuality.Major);
    export const m10 = new Interval(9, IntervalQuality.Minor);
    export const M10 = new Interval(9, IntervalQuality.Major);
    export const P11 = new Interval(10, IntervalQuality.Perfect);
    export const P12 = new Interval(11, IntervalQuality.Perfect);
    export const m13 = new Interval(12, IntervalQuality.Minor);
    export const M13 = new Interval(12, IntervalQuality.Major);
    export const m14 = new Interval(13, IntervalQuality.Minor);
    export const M14 = new Interval(13, IntervalQuality.Major);
    export const P15 = new Interval(14, IntervalQuality.Perfect);
    export const A1 = new Interval(0, IntervalQuality.Augmented);
    export const A2 = new Interval(1, IntervalQuality.Augmented);
    export const A3 = new Interval(2, IntervalQuality.Augmented);
    export const A4 = new Interval(3, IntervalQuality.Augmented);
    export const A5 = new Interval(4, IntervalQuality.Augmented);
    export const A6 = new Interval(5, IntervalQuality.Augmented);
    export const A7 = new Interval(6, IntervalQuality.Augmented);
    export const A8 = new Interval(7, IntervalQuality.Augmented);
    export const A9 = new Interval(8, IntervalQuality.Augmented);
    export const A10 = new Interval(9, IntervalQuality.Augmented);
    export const A11 = new Interval(10, IntervalQuality.Augmented);
    export const A12 = new Interval(11, IntervalQuality.Augmented);
    export const A13 = new Interval(12, IntervalQuality.Augmented);
    export const A14 = new Interval(13, IntervalQuality.Augmented);
    export const A15 = new Interval(14, IntervalQuality.Augmented);
    export const d1 = new Interval(0, IntervalQuality.Diminished);
    export const d2 = new Interval(1, IntervalQuality.Diminished);
    export const d3 = new Interval(2, IntervalQuality.Diminished);
    export const d4 = new Interval(3, IntervalQuality.Diminished);
    export const d5 = new Interval(4, IntervalQuality.Diminished);
    export const d6 = new Interval(5, IntervalQuality.Diminished);
    export const d7 = new Interval(6, IntervalQuality.Diminished);
    export const d8 = new Interval(7, IntervalQuality.Diminished);
    export const d9 = new Interval(8, IntervalQuality.Diminished);
    export const d10 = new Interval(9, IntervalQuality.Diminished);
    export const d11 = new Interval(10, IntervalQuality.Diminished);
    export const d12 = new Interval(11, IntervalQuality.Diminished);
    export const d13 = new Interval(12, IntervalQuality.Diminished);
    export const d14 = new Interval(13, IntervalQuality.Diminished);
    export const d15 = new Interval(14, IntervalQuality.Diminished);
// ReSharper restore InconsistentNaming


    export function isValid(number: number, quality: IntervalQuality): boolean {
        if (number < 0)
            throw new RangeError();

        const normalizedNumber = number % 7;
        if (normalizedNumber === 0 || normalizedNumber === 3 || normalizedNumber === 4)
            return quality !== IntervalQuality.Major && quality !== IntervalQuality.Minor;
        else
            return quality !== IntervalQuality.Perfect;
    }


}