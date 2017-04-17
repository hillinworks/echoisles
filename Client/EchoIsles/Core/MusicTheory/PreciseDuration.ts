
function getFixedPointValue(other: PreciseDuration | number): number {
    if (other as PreciseDuration)
        return (other as PreciseDuration).fixedPointValue;

    return (other as number) * PreciseDuration.unit;
}


export class PreciseDuration {

    readonly fixedPointValue: number;

    constructor(fixedPointValue: number) {
        this.fixedPointValue = fixedPointValue;
    }

    get duration(): number {
        return this.fixedPointValue / PreciseDuration.unit;
    }

    valueOf(): number {
        return this.fixedPointValue;
    }

    toString(): string {
        return this.duration.toString();
    }

    equals(other: PreciseDuration | number): boolean {
        return getFixedPointValue(other) === this.duration;
    }

    add(other: PreciseDuration | number): PreciseDuration {
        return new PreciseDuration(this.fixedPointValue + getFixedPointValue(other));
    }

    minus(other: PreciseDuration | number): PreciseDuration {
        return new PreciseDuration(this.fixedPointValue - getFixedPointValue(other));
    }

    multiply(factor: number): PreciseDuration {
        return new PreciseDuration(this.fixedPointValue * factor);
    }

    divideBy(other: PreciseDuration | number): number {
        return this.fixedPointValue / getFixedPointValue(other);
    }

    compareTo(other: PreciseDuration | number): number {
        return this.fixedPointValue - getFixedPointValue(other);
    }

}


export module PreciseDuration {
    export function equalityComparer(first: PreciseDuration, second: PreciseDuration): boolean {
        return first.equals(second);
    }

    export function comparer(first: PreciseDuration, second: PreciseDuration): number {
        return first.compareTo(second);
    }

    export function createComparer<T>(selector: (e: T) => PreciseDuration, descending = false) {
        return (a: T, b: T): number => descending
                                       ? - selector(a).compareTo(selector(b))
                                       : selector(a).compareTo(selector(b));
    }

    export const unit = 256 * 3 * 5 * 7 * 11 * 13 * 17 * 19 * 23 * 29;

    export const zero = new PreciseDuration(0);

    export function fromDuration(duration: number): PreciseDuration {
        return new PreciseDuration(duration * PreciseDuration.unit);
    }

    export function min<T>(array: T[], selector: (e: T) => PreciseDuration): PreciseDuration {

        let min = Number.MAX_SAFE_INTEGER;
        for (let item of array) {
            min = Math.min(min, selector(item).fixedPointValue);
        }

        return new PreciseDuration(min);
    }

    export function max<T>(array: T[], selector: (e: T) => PreciseDuration): PreciseDuration {
        let max = 0;
        for (let item of array) {
            max = Math.max(max, selector(item).fixedPointValue);
        }

        return new PreciseDuration(max);
    }

    export function sum<T>(array: T[], selector: (e: T) => PreciseDuration): PreciseDuration {
        let sum = 0;
        for (let item of array) {
            sum += selector(item).fixedPointValue;
        }

        return new PreciseDuration(sum);
    }
}