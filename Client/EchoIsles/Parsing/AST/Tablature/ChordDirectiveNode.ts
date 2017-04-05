import { DirectiveNode } from "../DirectiveNode";
import { LiteralNode } from "../LiteralNode";
import { ChordFingeringNode } from "./ChordFingeringNode";
import { DocumentContext } from "../../DocumentContext";
import { ILogger } from "../../../Core/Logging/ILogger";
import { LogLevel } from "../../../Core/Logging/LogLevel";
import { Messages } from "../../Messages";
import { ChordDefinition } from "../../../Core/Sheet/Tablature/ChordDefinition";
import { TablatureState } from "../../../Core/Sheet/Tablature/TablatureState";
import { Scanner, ParenthesisReadResult } from "../../Scanner";
import { IParseResult, ParseHelper } from "../../ParseResult";
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

    apply(context: DocumentContext, logger: ILogger): boolean {
        const result = this.toDocumentElement(context, logger);
        if (!result) {
            return false;
        }

        context.alterDocumentState(state => (state as TablatureState).definedChords.add(result));

        return true;
    }

    private toDocumentElement(context: DocumentContext, logger: ILogger): ChordDefinition | undefined {
        const tablatureState = context.documentState as TablatureState;
        if (any(tablatureState.definedChords, c => c.name === this.name.value)) {
            logger.report(LogLevel.Warning, this.range, Messages.Warning_ChordAlreadyDefined);
            return undefined;
        }

        const result = this.fingering.toDocumentElement(context, logger);
        if (!result)
            return undefined;

        const element = new ChordDefinition();
        element.range = this.range;
        element.displayName = this.displayName === undefined || this.displayName.value.length === 0
            ? this.name.value
            : this.displayName.value;
        element.name = this.name.value;
        element.fingering = result;

        return element;
    }
}

export module ChordDirectiveNode {
    export function parseBody(scanner: Scanner): IParseResult<ChordDirectiveNode> {
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
            return ParseHelper.relayState(fingering);
        }

        if (fingering.value!.fingerings.length === 0) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_ChordCommandletMissingFingering);
        }

        node.fingering = fingering.value!;
        return ParseHelper.success(node);
    }
}