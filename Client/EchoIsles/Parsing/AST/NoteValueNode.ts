import { Node } from "./Node";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { LiteralNode } from "./LiteralNode";
import { NoteValueAugment } from "../../Core/MusicTheory/NoteValueAugment";
import { NoteValue } from "../../Core/MusicTheory/NoteValue";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper, ParseResultType } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";
import { LiteralParsers } from "../LiteralParsers";
import { Messages } from "../Messages";

export class NoteValueNode extends Node {
    base: LiteralNode<BaseNoteValue>;
    augment?: LiteralNode<NoteValueAugment>;
    tuplet?: LiteralNode<number>;

    constructor(range?: TextRange) {
        super(range);
    }

    toNoteValue(): NoteValue {
        return new NoteValue(this.base.value,
            LiteralNode.valueOrDefault(this.augment, NoteValueAugment.None),
            LiteralNode.valueOrUndefined(this.tuplet));
    }
}

export module NoteValueNode {
    export function parse(scanner: Scanner): ParseResult<NoteValueNode> {
        const anchor = scanner.makeAnchor();
        const node = new NoteValueNode();
        const helper = new ParseHelper();

        const baseNoteValue = LiteralParsers.readBaseNoteValue(scanner);
        if (!ParseHelper.isSuccessful(baseNoteValue)) {
            return helper.fail(scanner.lastReadRange, Messages.Error_NoteValueExpected);
        }

        node.base = baseNoteValue.value!;

        if (scanner.expectChar("/")) { // tuplet
            const tuplet = LiteralParsers.readInteger(scanner);
            if (!ParseHelper.isSuccessful(tuplet)) {
                return helper.fail(scanner.lastReadRange, Messages.Error_TupletValueExpected);
            }

            if (!NoteValue.isValidTuplet(tuplet.value!.value)) {
                return helper.fail(scanner.lastReadRange, Messages.Error_InvalidTuplet);
            }
        }

        const augment = LiteralParsers.readNoteValueAugment(scanner);
        if (augment.result === ParseResultType.Failed) {
            return helper.relayFailure(augment);
        }

        node.augment = augment.value;

        node.range = anchor.range;
        return helper.success(node);
    }

}