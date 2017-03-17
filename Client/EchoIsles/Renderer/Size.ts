export class Size {

    constructor(public readonly width: number, public readonly height: number) { }

    equals(other: Size): boolean {
        return this.width === other.width && this.height === other.height;
    }

    toString(): string {
        return `${this.width} x ${this.height}`;
    }

}

export module Size {

    export const zero = new Size(0, 0);
    export const infinity = new Size(Infinity, Infinity);
}