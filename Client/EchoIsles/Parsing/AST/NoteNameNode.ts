import { Node } from "./Node";
import { BaseNoteName } from "../../Core/MusicTheory/BaseNoteName";
import { LiteralNode } from "./LiteralNode";
import { Accidental } from "../../Core/MusicTheory/Accidental";
import { NoteName } from "../../Core/MusicTheory/NoteName";
import { Scanner } from "../Scanner";
import { LiteralParsers } from "../LiteralParsers";
import { Messages } from "../Messages";
import { TextRange } from "../../Core/Parsing/TextRange";
import { IParseResult, ParseHelper, ParseResultType } from "../ParseResult";

export class NoteNameNode extends Node {

    static parse(scanner: Scanner): IParseResult<NoteNameNode> {
        const anchor = scanner.makeAnchor();

        const baseNoteName = LiteralParsers.readBaseNoteName(scanner);
        if (!ParseHelper.isSuccessful(baseNoteName)) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_InvalidNoteName);
        }

        const accidental = LiteralParsers.readAccidental(scanner);
        if (accidental.result === ParseResultType.Failed) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_InvalidAccidental);
        }

        return ParseHelper.success(new NoteNameNode(anchor.range, baseNoteName.value!, accidental.value!));
    }

    baseNoteName: LiteralNode<BaseNoteName>;
    accidental: LiteralNode<Accidental>;

    constructor(range: TextRange,
        baseNoteName: LiteralNode<BaseNoteName>,
        accidental: LiteralNode<Accidental>) {
        super(range);
        this.baseNoteName = baseNoteName;
        this.accidental = accidental;
    }

    toNoteName(): NoteName {
        return new NoteName(this.baseNoteName.value, this.accidental.value);
    }
}