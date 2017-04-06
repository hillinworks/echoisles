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
        const helper = new ParseHelper();
        const result = helper.absorb(this.compile(context));
        if (!ParseHelper.isSuccessful(result)) {
            return helper.empty();
        }

        context.alterDocumentState(state => state.keySignature = result.value);
        return helper.voidSuccess();
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
        const helper = new ParseHelper();
        scanner.skipOptional(":", true);
        const node = new KeyDirectiveNode();

        const noteName = helper.absorb(NoteNameNode.parse(scanner));
        if (!ParseHelper.isSuccessful(noteName)) {
            return helper.fail();
        }

        node.key = noteName.value!;
        return helper.success(node);
    }
}