import { DirectiveNode } from "../DirectiveNode";
import { LiteralNode } from "../LiteralNode";
import { ChordFingeringNode } from "./ChordFingeringNode";
import { DocumentContext } from "../../DocumentContext";
import { Messages } from "../../Messages";
import { ChordDefinition } from "../../../Core/Sheet/Tablature/ChordDefinition";
import { TablatureState } from "../../../Core/Sheet/Tablature/TablatureState";
import { Scanner, ParenthesisReadResult } from "../../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../../ParseResult";
import { LiteralParsers } from "../../LiteralParsers";
import { TextRange } from "../../../Core/Parsing/TextRange";
import { any } from "../../../Core/Utilities/LinqLite";

export class ChordDirectiveNode extends DirectiveNode {
    name: LiteralNode<string>;
    displayName?: LiteralNode<string>;
    fingering: ChordFingeringNode;

    constructor(range?: TextRange) {
        super(range);
    }

    apply(context: DocumentContext): ParseResultMaybeEmpty<void> {
        const result = this.compile(context);
        if (!ParseHelper.isSuccessful(result)) {
            return ParseHelper.relayState(result);
        }

        context.alterDocumentState(state => (state as TablatureState).definedChords.add(result.value));

        return ParseHelper.voidSuccess;
    }

    private compile(context: DocumentContext): ParseResultMaybeEmpty<ChordDefinition> {
        const helper = new ParseHelper();

        const tablatureState = context.documentState as TablatureState;
        if (any(tablatureState.definedChords, c => c.name === this.name.value)) {
            helper.warning(this.range, Messages.Warning_ChordAlreadyDefined);
            return helper.empty();
        }

        const result = this.fingering.compile(context);
        if (!ParseHelper.isSuccessful(result)) {
            return helper.relayFailure(result);
        }

        const element = new ChordDefinition();
        element.range = this.range;
        element.displayName = this.displayName === undefined || this.displayName.value.length === 0
            ? this.name.value
            : this.displayName.value;
        element.name = this.name.value;
        element.fingering = result.value;

        return helper.success(element);
    }
}

export module ChordDirectiveNode {
    export function parseBody(scanner: Scanner): ParseResult<ChordDirectiveNode> {
        const node = new ChordDirectiveNode();

        scanner.skipWhitespaces();

        const chordName = LiteralParsers.readChordName(scanner);
        if (!ParseHelper.isSuccessful(chordName) || chordName.value!.value.length === 0) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_MissingChordName);
        }

        node.name = chordName.value!;

        const parenthesis = scanner.readParenthesis("<", ">", false, false);
        if (parenthesis.result === ParenthesisReadResult.MissingClose) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_ChordDisplayNameNotEnclosed);
        } else if (parenthesis.result === ParenthesisReadResult.Success) {
            node.displayName = LiteralNode.create(parenthesis.text!, scanner.lastReadRange);
        }

        scanner.skipOptional(":", true);

        const fingering = ChordFingeringNode.parse(scanner, s => s.isEndOfLine);
        if (!ParseHelper.isSuccessful(fingering)) {
            return ParseHelper.relayFailure(fingering);
        }

        if (fingering.value!.fingerings.length === 0) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_ChordCommandletMissingFingering);
        }

        node.fingering = fingering.value!;
        return ParseHelper.success(node);
    }
}