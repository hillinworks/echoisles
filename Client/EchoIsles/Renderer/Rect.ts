import { Point } from "./Point";
import { Size } from "./Size";
import { IRectLike } from "./IRectLike";
import { ISizeLike } from "./ISizeLike";

export class Rect {
    constructor(public left: number, public top: number, public width: number, public height: number) { }

    get right(): number {
        return this.left + this.width;
    }

    get bottom(): number {
        return this.top + this.height;
    }

    get topLeft(): Point {
        return new Point(this.left, this.top);
    }

    get topRight(): Point {
        return new Point(this.right, this.top);
    }

    get center(): Point {
        return new Point(this.left + this.width / 2, this.top + this.height / 2);
    }

    get bottomLeft(): Point {
        return new Point(this.left, this.bottom);
    }

    get bottomRight(): Point {
        return new Point(this.right, this.bottom);
    }

    get size(): Size {
        return new Size(this.width, this.height);
    }

    equals(other: IRectLike): boolean {
        return this.left === other.left && this.top === other.top && this.width === other.width && this.height === other.height;
    }

    union(other: IRectLike): Rect {
        const left = Math.min(this.left, other.left);
        const top = Math.min(this.top, other.top);
        const right = Math.max(this.right, other.left + other.width);
        const bottom = Math.max(this.bottom, other.top + other.height);
        return new Rect(left, top, right - left, bottom - top);
    }

    inflate(size: ISizeLike): Rect {
        return new Rect(this.left - size.width,
            this.top - size.height,
            this.width + size.width * 2,
            this.height + size.height * 2);
    }

    toString(): string {
        return `${this.topLeft} - ${this.bottomRight}`;
    }
}

export module Rect {

    export const zero = new Rect(0, 0, 0, 0);

    export function create(topLeft: Point, size: ISizeLike = Size.zero): Rect {
        return new Rect(topLeft.x, topLeft.y, size.width, size.height);
    }

    export function createFromCenter(center: Point, size: ISizeLike = Size.zero): Rect {
        return new Rect(center.x - size.width / 2, center.y - size.height / 2, size.width, size.height);
    }

    export function fromRectLike(rectLike: IRectLike) {
        return new Rect(rectLike.left, rectLike.top, rectLike.width, rectLike.height);
    }

}