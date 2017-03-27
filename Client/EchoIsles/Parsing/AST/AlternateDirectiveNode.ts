import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";
import { DocumentContext } from "../DocumentContext";
import { ILogger } from "../../Core/Logging/ILogger";
import { Alternation } from "../../Core/Sheet/Alternation";
import { Explicity } from "../../Core/Explicity";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { AlternationText } from "../../Core/MusicTheory/AlternationText";
import { assert } from "../../Core/Utilities/Debug";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";
import {max} from "../../Core/Utilities/LinqLite";

export class AlternateDirectiveNode extends DirectiveNode {

    readonly alternationTexts = new Array<LiteralNode<string>>();

    constructor(range?: TextRange) {
        super(range);
    }

    apply(context: DocumentContext, logger: ILogger): boolean {
        const result = this.toDocumentElement(context, logger);
        if (!result) {
            return false;
        }

        if (context.documentState.alternationTextExplicity !== Explicity.NotSpecified
            && result.explicity !== context.documentState.alternationTextExplicity) {
            logger.report(LogLevel.Warning,
                this.range.to.toRange(),
                Messages.Warning_InconsistentAlternationTextExplicity);
        }

        context.alterDocumentState(state => {
            for (let index of result.indices) {
                state.definedAlternationIndices.add(index);
            }

            state.currentAlternation = result;
            state.alternationTextType = result.textType;
            state.alternationTextExplicity = result.explicity;
        });

        return true;
    }

    private toDocumentElement(context: DocumentContext, logger: ILogger): Alternation | undefined {
        if (this.alternationTexts.length === 0) { // implicit
            const implicitIndex = max(context.documentState.definedAlternationIndices) + 1;
            const alternation = new Alternation();
            alternation.range = this.range;
            alternation.textType = context.documentState.alternationTextType === undefined
                ? AlternationText.Type.Arabic
                : context.documentState.alternationTextType;
            alternation.explicity = Explicity.Implicit;
            alternation.indices = [implicitIndex];

            return alternation;
        }

        const element = new Alternation();
        element.range = this.range;
        element.explicity = Explicity.Explicit;

        let referenceTextType = context.documentState.alternationTextType;
        const indices = new Array<number>();

        for (let alternationText of this.alternationTexts) {

            const result = AlternationText.parse(alternationText.value);
            if (!result) {
                throw new Error("parse failed");
            }

            if (referenceTextType !== undefined && referenceTextType !== result.type) {
                logger.report(LogLevel.Warning,
                    alternationText.range,
                    Messages.Warning_InconsistentAlternationTextType);
            } else {
                referenceTextType = result.type;
            }

            if (context.documentState.definedAlternationIndices.contains(result.index)) {
                logger.report(LogLevel.Error, alternationText.range,
                    Messages.Error_DuplicatedAlternationText, alternationText.value);

                return undefined;
            }

            indices.push(result.index);
        }

        assert(referenceTextType !== undefined, "referenceTextType !== undefined");
        element.textType = referenceTextType;
        element.indices = indices;
        return element;
    }
}

export module AlternateDirectiveNode {

    export function parseBody(scanner: Scanner): IParseResult<AlternateDirectiveNode> {

        const node = new AlternateDirectiveNode();
        const hasColon = scanner.skipOptional(":", true);
        const helper = new ParseHelper();

        while (!scanner.isEndOfLine) {
            const text = scanner.readPattern("\\w+");
            if (!text || !AlternationText.isValid(text!)) {
                return helper.fail(scanner.lastReadRange, Messages.Error_InvalidAlternationText);
            }

            node.alternationTexts.push(LiteralNode.create(text, scanner.lastReadRange));
            scanner.skipOptional(",", true);
        }

        if (hasColon && node.alternationTexts.length === 0) {
            helper.warning(scanner.lastReadRange, Messages.Warning_AlternationTextExpectedAfterColon);
        }
        
        return helper.success(node);
    }

}