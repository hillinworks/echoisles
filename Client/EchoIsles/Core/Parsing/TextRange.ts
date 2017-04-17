import { TextPointer } from "./TextPointer";
import { TextSource } from "./TextSource";

export class TextRange {
    from: TextPointer;
    to: TextPointer;

    readonly source?: TextSource;

    constructor(from: TextPointer, toOrLength: TextPointer | number, source?: TextSource) {
        this.from = from;
        this.to = (toOrLength instanceof TextPointer) ? toOrLength as TextPointer : from.offsetColumn(toOrLength as number);
        this.source = source;
    }

    get content(): string {
        return this.source === undefined ? "(source unavailable)" : this.source.substring(this);
    }

    union(range: TextRange): TextRange {
        return new TextRange(this.from > range.from ? range.from : this.from,
            this.to > range.to ? this.to : range.to);
    }

    equals(other: TextRange): boolean {
        return this.from === other.from
            && this.to === other.to;
    }

    toString(): string {
        return `${this.from} - ${this.to}`;
    }
}