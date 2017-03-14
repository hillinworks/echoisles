import { DirectiveNode } from "./DirectiveNode";
import { DocumentContext } from "../DocumentContext";
import { ILogger } from "../../Core/Logging/ILogger";
import { KeySignature } from "../../Core/Sheet/KeySignature";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { NoteNameNode } from "./NoteNameNode";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";

export class KeyDirectiveNode extends DirectiveNode {
    key: NoteNameNode;

    constructor(range?: TextRange) {
        super(range);
    }

    apply(context: DocumentContext, logger: ILogger): boolean {
        const result = this.toDocumentElement(context, logger);
        if (!result)
            return false;

        context.alterDocumentState(state => state.keySignature = result);
        return true;
    }

    private toDocumentElement(context: DocumentContext, logger: ILogger): KeySignature | undefined {
        const noteName = this.key.toNoteName();
        if (context.documentState.keySignature !== undefined && context.documentState.keySignature.key === noteName) {
            logger.report(LogLevel.Suggestion, this.range, Messages.Suggestion_RedundantKeySignature);
            return undefined;  // todo: really? for a suggestion?
        }

        const element = new KeySignature();
        element.range = this.range;
        element.key = noteName;

        return element;
    }
}

export module KeyDirectiveNode {
    export function parseBody(scanner: Scanner): IParseResult<KeyDirectiveNode> {
        scanner.skipOptional(":", true);
        const node = new KeyDirectiveNode();

        const noteName = NoteNameNode.parse(scanner);
        if (!ParseHelper.isSuccessful(noteName)) {
            return ParseHelper.relayState(noteName);
        }

        node.key = noteName.value!;
        return ParseHelper.success(node);
    }
}