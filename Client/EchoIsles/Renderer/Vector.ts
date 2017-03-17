export class Vector {
    constructor(public readonly x: number, public readonly y: number) { }

    equals(other: Vector): boolean {
        return this.x === other.x && this.y === other.y;
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}

export module Vector {
    export const zero = new Vector(0, 0);
}