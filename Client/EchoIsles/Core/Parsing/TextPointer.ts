import { TextRange } from "./TextRange";
import { TextSource } from "./TextSource";

export class TextPointer {

    static get zero(): TextPointer { return new TextPointer(0, 0) };

    row: number;
    column: number;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column;
    }

    get nextColumn() { return this.offsetColumn(1); }
    get nextRow() { return this.offsetRow(1, true); }

    offset(base: TextPointer): TextPointer {
        return new TextPointer(base.row + this.row, base.column + this.column);
    }

    offsetRow(rowOffset: number, resetColumn: boolean = true): TextPointer {
        return new TextPointer(this.row + rowOffset, resetColumn ? 0 : this.column);
    }

    offsetColumn(columnOffset: number): TextPointer {
        return new TextPointer(this.row, this.column + columnOffset);
    }

    toRange(to?: TextPointer, source?: TextSource): TextRange {
        return new TextRange(this, to === undefined ? this : to, source);
    }

    asRange(source?: TextSource): TextRange {
        return new TextRange(this, this, source);
    }

    compareTo(other: TextPointer): number {
        return this.row === other.row ? this.column - other.column : this.row - other.row;
    }

    toString(): string {
        return `${this.row}:${this.column}`;
    }

    equals(other: TextPointer): boolean {
        return other && this.row === other.row && this.column === other.column;
    }
}