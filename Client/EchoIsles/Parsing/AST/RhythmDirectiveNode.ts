import { DirectiveNode } from "./DirectiveNode";
import { RhythmTemplateNode } from "./RhythmTemplateNode";
import { DocumentContext } from "../DocumentContext";
import { ILogger } from "../../Core/Logging/ILogger";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { RhythmTemplate } from "../../Core/Sheet/RhythmTemplate";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";

export class RhythmDirectiveNode extends DirectiveNode {
    templateNode: RhythmTemplateNode;

    apply(context: DocumentContext, logger: ILogger): boolean {
        const tablatureState = context.documentState as TablatureState;
        if (tablatureState.rhythmTemplate !== undefined && this.valueEquals(tablatureState.rhythmTemplate)) {
            logger.report(LogLevel.Suggestion, this.range, Messages.Suggestion_UselessRhythmInstruction);
            return true;
        }

        context.currentBar = undefined; // todo: this is ugly, refactor it

        const result = this.templateNode.toDocumentElement(context, logger);
        if (!result)
            return false;

        context.alterDocumentState(state => (state as TablatureState).rhythmTemplate = result);

        return true;
    }

    valueEquals(other: RhythmTemplate): boolean {
        return this.templateNode.valueEquals(other);
    }
}

export module RhythmDirectiveNode {
    export function parseBody(scanner: Scanner): IParseResult<RhythmDirectiveNode> {
        scanner.skipOptional(":", true);
        const template = RhythmTemplateNode.parse(scanner);
        if (!ParseHelper.isSuccessful(template)) {
            return ParseHelper.relayState(template);
        }

        const node = new RhythmDirectiveNode();
        node.templateNode = template.value!;

        return ParseHelper.success(node);
    }
}