import { TextPointer } from "../Core/Parsing/TextPointer";
import { TextSource } from "../Core/Parsing/TextSource";
import { TextRange } from "../Core/Parsing/TextRange";
import { StringBuilder } from "../Core/Utilities/StringBuilder";
import { StringUtilities } from "../Core/Utilities/StringUtilities";

export class Anchor {
    private readonly owner: Scanner;
    readonly from: TextPointer;

    trimTailingWhitespaces: boolean;

    constructor(owner: Scanner, trimTailingWhitespaces = true) {
        this.owner = owner;
        this.from = owner.textPointer;
        this.trimTailingWhitespaces = trimTailingWhitespaces;
    }

    get range(): TextRange {

        let to = this.owner.textPointer;

        if (!this.trimTailingWhitespaces) {
            return new TextRange(this.from, to, this.owner.source);
        }

        let row = this.owner.source.getLine(to.row);

        while (to.compareTo(this.from) > 0) {

            if (to.column === 0) {
                const previousRowIndex = to.row - 1;
                row = this.owner.source.getLine(previousRowIndex);
                to = new TextPointer(previousRowIndex, row.length - 1);     // should be '\n'
                continue;
            }

            if (!StringUtilities.isWhitespaceChar(row[to.column - 1])) {
                break;
            }

            to = to.offsetColumn(-1);
        }

        return new TextRange(this.from, to, this.owner.source);
    }
}

export enum ParenthesisReadResult {
    Success,
    MissingOpen,
    MissingClose,
};

function checkInline(char: string, inline: boolean): boolean {
    return !(inline && char === "\n");
}


export class Scanner {
    readonly source: TextSource;
    private _textPointer: TextPointer;
    private _isEndOfInput: boolean;
    private _lastReadRange: TextRange;

    constructor(source: TextSource | string) {
        this.source = (source instanceof TextSource) ? source as TextSource : new TextSource(source as string);
        this.reset();
    }

    get textPointer(): TextPointer {
        return this._textPointer;
    }

    set textPointer(value: TextPointer) {
        this._textPointer = value;
        this.checkEndOfFile();
    }

    get isEndOfInput(): boolean {
        return this._isEndOfInput;
    }

    get isEndOfLine(): boolean {
        return this.isEndOfInput
            || this._textPointer.column >= this.source.getLine(this._textPointer.row).length
            || this.peekChar() === "\n";
    }

    get lastReadRange(): TextRange {
        return this._lastReadRange;
    }

    get remainingLine() {
        const row = this.source.getLine(this._textPointer.row);
        if (this._textPointer.column >= row.length) {
            return "";
        }

        const result = row.substr(this._textPointer.column);
        return result[result.length - 1] === "\n" ? result.substr(0, result.length - 1) : result;
    }

    makeAnchor(trimTailingWhitespaces = true): Anchor {
        return new Anchor(this, trimTailingWhitespaces);
    }

    private recordReadRange<T>(action: () => T): T {
        const from = this.textPointer;
        const result = action();
        this._lastReadRange = new TextRange(from, this.textPointer, this.source);
        return result;
    }

    reset(): void {
        this._textPointer = TextPointer.zero;
        this._isEndOfInput = false;
    }

    private carriageReturn(): void {
        this._textPointer = this._textPointer.nextRow;
        this.checkEndOfFile();
    }

    private checkEndOfFile(): void {
        this._isEndOfInput = this.source.isEndOfSource(this._textPointer);
    }

    private moveNext(offset = 1): void {
        if (this.isEndOfInput) {
            return;
        }

        if (this.isEndOfLine) {
            this.carriageReturn();
        } else {
            this._textPointer = this._textPointer.offsetColumn(offset);
            this.checkEndOfFile();
        }
    }

    peekChar(): string {
        return this.source.getChar(this._textPointer);
    }

    peek(length?: number, inline = true): string {

        if (length === undefined)
            return this.peekChar();

        const savedPointer = this._textPointer;

        const builder = new StringBuilder();

        while (!this.isEndOfInput && length > 0) {
            const char = this.source.getChar(this._textPointer);
            if (!checkInline(char, inline)) {
                break;
            }

            builder.append(char);
            this.moveNext();

            --length;
        }

        this.textPointer = savedPointer;
        return builder.toString();
    }

    skip(predicate?: (char: string) => boolean): void {
        if (!predicate)
            this.moveNext();
        else {
            while (!this.isEndOfInput && predicate(this.peekChar()))
                this.moveNext();
        }
    }

    skipWhitespaces(inline = true): void {
        if (inline) {
            this.skip(c => StringUtilities.isWhitespaceChar(c) && c !== "\n");
        } else {
            this.skip(StringUtilities.isWhitespaceChar);
        }
    }

    skipOptional(optionalChar: string, skipWhitespaces = false): boolean {
        if (skipWhitespaces) {
            this.skipWhitespaces();
        }

        if (this.peekChar() === optionalChar) {
            this.moveNext();

            if (skipWhitespaces) {
                this.skipWhitespaces();
            }

            return true;
        }

        return false;
    }

    skipLine(): void {
        this.carriageReturn();
    }

    expectChar(expectedChar: string): boolean {
        if (this.isEndOfInput) {
            return false;
        }

        return this.recordReadRange(() => {
            if (this.peek() === expectedChar) {
                this.moveNext();
                return true;
            }

            return false;
        });
    }

    expect(value: string, ignoreCase = false): boolean {
        if (this.isEndOfInput) {
            return false;
        }

        return this.recordReadRange(() => {
            let remainingLine = this.remainingLine;
            if (ignoreCase) {
                remainingLine = remainingLine.toUpperCase();
                value = value.toUpperCase();
            }

            if (remainingLine.startsWith(value)) {
                this.moveNext(value.length);
                return true;
            }

            return false;
        });
    }

    readChar(): string {
        return this.recordReadRange(() => {
            const result = this.source.getChar(this._textPointer);
            this.moveNext();

            return result;
        });
    }

    read(predicate: (char: string) => boolean, inline = true): string {

        return this.recordReadRange(() => {
            const builder = new StringBuilder();

            while (!this.isEndOfInput) {
                const char = this.peekChar();

                if (!checkInline(char, inline)) {
                    break;
                }

                if (!predicate(char)) {
                    break;
                }

                builder.append(char);
                this.moveNext();
            }

            return builder.toString();
        });
    }

    private readPatternInternal(pattern: RegExp): string | undefined {
        return this.recordReadRange(() => {
            const remainingLine = this.remainingLine;
            const match = pattern.exec(remainingLine);

            if (!match || match.length === 0)
                return undefined;

            const result = match[0];
            this._textPointer = this._textPointer.offsetColumn(result.length - 1);

            this.moveNext();
            return result;
        });
    }

    readPattern(pattern: string): string | undefined {
        return this.readPatternInternal(new RegExp(`^${pattern}`));
    }

    readAnyPatternOf(...patterns: string[]): string | undefined {
        if (patterns === undefined || patterns.length === 0) {
            throw new Error("no pattern");
        }

        if (patterns.length === 1) {
            return this.readPattern(patterns[0]);
        }

        return this.readPatternInternal(new RegExp(`^(${patterns.join("|")})`));
    }

    readToLineEnd(): string {
        return this.recordReadRange(() => {
            const result = this.remainingLine;
            this.textPointer = this._textPointer.offsetColumn(result.length);
            return result;
        });
    }

    match(pattern: string): RegExpExecArray | undefined {
        return this.recordReadRange(() => {
            const remainingLine = this.remainingLine;
            const match = new RegExp(`^${pattern}`).exec(remainingLine);

            if (match && match.length > 0) {
                this.textPointer = this._textPointer.offsetColumn(match[0].length - 1);
                this.moveNext();
            }

            return match || undefined;
        });
    }

    readInteger(): number | undefined {
        const text = this.read(StringUtilities.isDigitChar);
        const value = parseInt(text);

        return isNaN(value) ? undefined : value;
    }

    readParenthesis(open = "(", close = ")", includeParenthesis = false, allowNesting = true, inline = true):
        { result: ParenthesisReadResult, text?: string } {

        let anchor: Anchor | undefined = undefined;
        if (includeParenthesis) {
            anchor = this.makeAnchor();
        }
        if (!this.expect(open)) {
            return { result: ParenthesisReadResult.MissingOpen };
        }

        if (!includeParenthesis) {
            anchor = this.makeAnchor();
        }

        if (!anchor) {
            throw new Error("you shall not pass");
        }

        const builder = new StringBuilder();

        if (includeParenthesis) {
            builder.append(open);
        }

        let nestLevel = 1; // won't be increased if allowNesting is false

        while (!this.isEndOfInput) {
            const char = this.peekChar();

            if (!checkInline(char, inline)) {
                this.moveNext();
                return { result: ParenthesisReadResult.MissingClose, text: builder.toString() };
            }

            if (char === open && allowNesting) {
                ++nestLevel;
            } else if (char === close) {
                --nestLevel;
                if (nestLevel === 0) {
                    if (includeParenthesis) {
                        builder.append(this.readChar());
                        // ReSharper disable once QualifiedExpressionMaybeNull
                        this._lastReadRange = anchor.range;
                    } else {
                        // ReSharper disable once QualifiedExpressionMaybeNull
                        this._lastReadRange = anchor.range;
                        this.moveNext();
                    }

                    break;
                }
            }

            builder.append(this.readChar());
        }

        return {
            result: nestLevel === 0 ? ParenthesisReadResult.Success : ParenthesisReadResult.MissingClose,
            text: builder.toString()
        };
    }
}

export module Scanner {
    export type Predicate = (scanner: Scanner) => boolean;
}