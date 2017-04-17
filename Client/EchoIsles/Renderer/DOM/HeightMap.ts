import { ISequence, max } from "../../Core/Utilities/LinqLite";
import { Point } from "../Point";

export class HeightMap {

    private readonly heights: number[];
    private readonly sampleRateInversed: number;

    constructor(width: number, sampleRate: number, filledHeight = 0) {
        this.sampleRateInversed = 1 / sampleRate;
        this.heights = new Array<number>(Math.ceil(width / sampleRate));
        this.fill(filledHeight);
    }

    getIndex(position: number): number {
        return position * this.sampleRateInversed;
    }

    getIndices(position: number, size: number): Iterable<number> {
        return ISequence.range(this.getIndex(position), Math.ceil(size * this.sampleRateInversed));
    }

    getIndicesGuarded(position: number, size: number): Iterable<number> {
        const from = Math.max(0, this.getIndex(position));
        const to = Math.min(this.heights.length - 1, this.getIndex(position + size));
        return ISequence.range(from, to - from + 1);
    }

    getHeight(position: number, size?: number): number {
        if (size === undefined) {
            return this.heights[this.getIndex(position)];
        } else {
            return (this.getIndices(position, size) as ISequence<number>).max(i => this.heights[i]);
        }
    }

    setHeight(position: number, size: number, height: number) {
        if (size <= 1) {
            this.heights[this.getIndex(position)] = height;
        } else {
            for (let index of this.getIndices(position, size)) {
                this.heights[index] = height;
            }
        }
    }

    ensureHeight(from: number, size: number, height: number) {
        if (from < 0) {
            size += from;
            from = 0;
        }
        if (from + size >= this.heights.length) {
            size = this.heights.length - from;
        }

        for (let index of this.getIndices(from, size)) {
            this.heights[index] = Math.max(this.heights[index], height);
        }
    }

    ensureHeightSloped(from: number, size: number, fromHeight: number, toHeight: number, hMargin: number) {
        const slope = (toHeight - fromHeight) / size;

        for (let index of this.getIndicesGuarded(from - hMargin, hMargin)) {
            this.heights[index] = Math.max(this.heights[index], fromHeight);
        }

        for (let index of this.getIndicesGuarded(from, size)) {
            this.heights[index] = Math.max(this.heights[index],
                fromHeight + slope * (index / this.sampleRateInversed - from));
        }

        for (let index of this.getIndicesGuarded(from + size, hMargin)) {
            this.heights[index] = Math.max(this.heights[index], toHeight);
        }
    }

    fill(height: number) {
        this.heights.fill(height);
    }

    *debugGetVertices(): Iterable<Point> {
        if (this.heights.length === 0) {
            return;
        }

        let previousHeight = this.heights[0];
        yield new Point(0, previousHeight);

        const lastIndex = this.heights.length - 1;
        for (let i = 1; i < lastIndex; ++i) {
            const height = this.heights[i];
            if (Math.abs(height - previousHeight) > 1e-3) {
                const x = i / this.sampleRateInversed;
                yield new Point(x, previousHeight);
                yield new Point(x, height);
                previousHeight = height;
            }
        }

        yield new Point(lastIndex / this.sampleRateInversed, this.heights[lastIndex]);
    }

    seal() {
        this.fill(max(this.heights));
    }
}