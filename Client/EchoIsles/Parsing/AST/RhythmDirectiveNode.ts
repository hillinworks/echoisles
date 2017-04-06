import { DirectiveNode } from "./DirectiveNode";
import { RhythmTemplateNode } from "./RhythmTemplateNode";
import { DocumentContext } from "../DocumentContext";
import { Messages } from "../Messages";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { RhythmTemplate } from "../../Core/Sheet/RhythmTemplate";
import { Scanner } from "../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../ParseResult";

export class RhythmDirectiveNode extends DirectiveNode {
    templateNode: RhythmTemplateNode;

    apply(context: DocumentContext): ParseResultMaybeEmpty<void> {
        const helper = new ParseHelper();
        const tablatureState = context.documentState as TablatureState;
        if (tablatureState.rhythmTemplate !== undefined && this.valueEquals(tablatureState.rhythmTemplate)) {
            helper.suggestion(this.range, Messages.Suggestion_UselessRhythmInstruction);
            return helper.success(undefined);
        }

        context.currentBar = undefined; // todo: this is ugly, refactor it

        const result = helper.absorb(this.templateNode.compile(context));
        if (!ParseHelper.isSuccessful(result)) {
            return helper.fail();
        }

        context.alterDocumentState(state => (state as TablatureState).rhythmTemplate = result.value);

        return helper.success(undefined);
    }

    valueEquals(other: RhythmTemplate): boolean {
        return this.templateNode.valueEquals(other);
    }
}

export module RhythmDirectiveNode {
    export function parseBody(scanner: Scanner): ParseResult<RhythmDirectiveNode> {
        const helper = new ParseHelper();
        scanner.skipOptional(":", true);
        const template = helper.absorb(RhythmTemplateNode.parse(scanner));
        if (!ParseHelper.isSuccessful(template)) {
            return helper.fail();
        }

        const node = new RhythmDirectiveNode();
        node.templateNode = template.value!;

        return helper.success(node);
    }
}