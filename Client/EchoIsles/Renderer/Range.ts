export class Range
{
    constructor(readonly from: number, readonly to: number) {
        
    }

    get size(): number {
        return this.to - this.from;
    }

    union(other: Range) {
        return new Range(Math.min(this.from, other.from), Math.max(this.to, other.to));
    }

    offset(magnitude: number) {
        return new Range(this.from + magnitude, this.to + magnitude);
    }
}

export module Range {
    export const zero = new Range(0, 0);
}