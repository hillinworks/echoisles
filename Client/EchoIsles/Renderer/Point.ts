import { Vector } from "./Vector";

export class Point {
    constructor(public readonly x: number, public readonly y: number) { }

    translate(vector: Vector): Point {
        return new Point(this.x + vector.x, this.y + vector.y);
    }

    substract(other: Point): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    equals(other: Point): boolean {
        return this.x === other.x && this.y === other.y;
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }

    toVector(): Vector {
        return new Vector(this.x, this.y);
    }
}

export module Point {
    export const zero = new Point(0, 0);

    export function average(points: Iterable<Point>): Point {
        let sumX = 0, sumY = 0, count = 0;
        for (let point of points) {
            sumX += point.x;
            sumY += point.y;
            ++count;
        }

        return new Point(sumX / count, sumY / count);
    }
}