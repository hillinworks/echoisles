import { DirectiveNode } from "./DirectiveNode";
import { DocumentContext } from "../DocumentContext";
import { KeySignature } from "../../Core/Sheet/KeySignature";
import { Messages } from "../Messages";
import { NoteNameNode } from "./NoteNameNode";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper, ParseSuccessOrEmptyResult } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";

export class KeyDirectiveNode extends DirectiveNode {
    key: NoteNameNode;

    constructor(range?: TextRange) {
        super(range);
    }

    apply(context: DocumentContext): ParseSuccessOrEmptyResult<void> {
        const result = this.compile(context);
        if (!ParseHelper.isSuccessful(result)) {
            return ParseHelper.empty(...result.messages);
        }

        context.alterDocumentState(state => state.keySignature = result.value);
        return ParseHelper.voidSuccess;
    }

    private compile(context: DocumentContext): ParseSuccessOrEmptyResult<KeySignature> {
        const helper = new ParseHelper();
        const noteName = this.key.toNoteName();
        if (context.documentState.keySignature !== undefined && context.documentState.keySignature.key === noteName) {
            helper.suggestion(this.range, Messages.Suggestion_RedundantKeySignature);
            return helper.empty();
        }

        const element = new KeySignature();
        element.range = this.range;
        element.key = noteName;

        return helper.success(element);
    }
}

export module KeyDirectiveNode {
    export function parseBody(scanner: Scanner): ParseResult<KeyDirectiveNode> {
        scanner.skipOptional(":", true);
        const node = new KeyDirectiveNode();

        const noteName = NoteNameNode.parse(scanner);
        if (!ParseHelper.isSuccessful(noteName)) {
            return ParseHelper.relayFailure(noteName);
        }

        node.key = noteName.value!;
        return ParseHelper.success(node);
    }
}