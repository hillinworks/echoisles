import { Node } from "./Node";
import { BaseNoteName } from "../../Core/MusicTheory/BaseNoteName";
import { LiteralNode } from "./LiteralNode";
import { Accidental } from "../../Core/MusicTheory/Accidental";
import { NoteName } from "../../Core/MusicTheory/NoteName";
import { Scanner } from "../Scanner";
import { LiteralParsers } from "../LiteralParsers";
import { Messages } from "../Messages";
import { TextRange } from "../../Core/Parsing/TextRange";
import { ParseResult, ParseHelper } from "../ParseResult";

export class NoteNameNode extends Node {

    static parse(scanner: Scanner): ParseResult<NoteNameNode> {
        const helper = new ParseHelper();
        const anchor = scanner.makeAnchor();

        const baseNoteName = helper.absorb(LiteralParsers.readBaseNoteName(scanner));
        if (!ParseHelper.isSuccessful(baseNoteName)) {
            return helper.fail(scanner.lastReadRange, Messages.Error_InvalidNoteName);
        }

        const accidental = helper.absorb(LiteralParsers.readAccidental(scanner));

        let accidentalNode: LiteralNode<Accidental> | undefined = undefined;
        if (ParseHelper.isSuccessful(accidental)) {
            accidentalNode = accidental.value;
        } else if (ParseHelper.isFailed(accidental)) {
            return helper.fail(scanner.lastReadRange, Messages.Error_InvalidAccidental);
        }

        return helper.success(new NoteNameNode(anchor.range, baseNoteName.value!, accidentalNode));
    }

    constructor(range: TextRange,
        readonly baseNoteName: LiteralNode<BaseNoteName>,
        readonly accidental?: LiteralNode<Accidental>) {
        super(range);
        this.baseNoteName = baseNoteName;
        this.accidental = accidental;
    }

    toNoteName(): NoteName {
        return new NoteName(this.baseNoteName.value, LiteralNode.valueOrDefault(this.accidental, Accidental.Natural));
    }
}