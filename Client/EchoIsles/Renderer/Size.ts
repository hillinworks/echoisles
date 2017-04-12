export class Size {

    constructor(public readonly width: number, public readonly height: number) { }

    add(other: Size): Size {
        return new Size(this.width + other.width, this.height + other.height);
    }

    inflate(size: Size): Size {
        return new Size(this.width + size.width * 2, this.height + size.height * 2);
    }

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

    export function fromSizeLike(sizeLike: { width: number, height: number }) {
        return new Size(sizeLike.width, sizeLike.height);
    }
}