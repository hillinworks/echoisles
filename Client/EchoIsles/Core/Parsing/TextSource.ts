import { TextRange } from "./TextRange";
import { TextPointer } from "./TextPointer";
import { StringBuilder } from "../Utilities/StringBuilder";

export class TextSource {
    private readonly lines: string[];

    constructor(input: string) {
        this.lines = input.split("\n");
        for (let i = 0; i < this.lines.length - 1; ++i) {
            const line = this.lines[i];
            if (line.endsWith("\r"))
                this.lines[i] = line.substr(0, line.length - 1).concat("\n");
            else
                this.lines[i] = line.concat("\n");
        }
    }

    substring(range: TextRange): string {
        const builder = new StringBuilder();

        for (const p = range.from; p < range.to;) {
            const row = this.lines[p.row];
            builder.append(row[p.column]);
            ++p.column;
            if (p.column >= row.length) {
                ++p.row;
                p.column = 0;
            }
        }

        return builder.toString();
    }

    isEndOfSource(position: TextPointer): boolean {
        if (position.row >= this.lines.length)
            return true;

        if (position.row === this.lines.length - 1
            && position.column >= this.lines[position.row].length)
            return true;

        return false;
    }

    getLine(row: number): string { return this.lines[row]; }
    getChar(position: TextPointer): string { return this.lines[position.row][position.column]; }
}