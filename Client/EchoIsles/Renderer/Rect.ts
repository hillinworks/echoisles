import { Point } from "./Point";
import { Size } from "./Size";

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

    equals(other: Rect): boolean {
        return this.left === other.left && this.top === other.top && this.width === other.width && this.height === other.height;
    }

    union(other: Rect): Rect {
        const left = Math.min(this.left, other.left);
        const top = Math.min(this.top, other.top);
        const right = Math.max(this.right, other.right);
        const bottom = Math.max(this.bottom, other.bottom);
        return new Rect(left, top, right - left, bottom - top);
    }

    toString(): string {
        return `${this.topLeft} - ${this.bottomRight}`;
    }
}

export module Rect {

    export function create(topLeft: Point, size = Size.zero): Rect {
        return new Rect(topLeft.x, topLeft.y, size.width, size.height);
    }

}