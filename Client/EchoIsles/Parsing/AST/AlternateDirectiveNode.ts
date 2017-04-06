import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";
import { DocumentContext } from "../DocumentContext";
import { Alternation } from "../../Core/Sheet/Alternation";
import { Explicity } from "../../Core/Explicity";
import { Messages } from "../Messages";
import { AlternationText } from "../../Core/MusicTheory/AlternationText";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";
import { max } from "../../Core/Utilities/LinqLite";

export class AlternateDirectiveNode extends DirectiveNode {

    readonly alternationTexts = new Array<LiteralNode<string>>();

    constructor(range?: TextRange) {
        super(range);
    }

    apply(context: DocumentContext): ParseResult<void> {
        const helper = new ParseHelper();
        const result = helper.absorb(this.compile(context));
        if (!ParseHelper.isSuccessful(result)) {
            return helper.fail();
        }

        const alternation = result.value;

        if (context.documentState.alternationTextExplicity !== Explicity.NotSpecified
            && alternation.explicity !== context.documentState.alternationTextExplicity) {
            helper.warning(this.range.to.toRange(), Messages.Warning_InconsistentAlternationTextExplicity);
        }

        context.alterDocumentState(state => {

            for (let index of alternation.indices) {
                state.definedAlternationIndices.add(index);
            }

            state.currentAlternation = alternation;
            state.alternationTextType = alternation.textType;
            state.alternationTextExplicity = alternation.explicity;
        });

        return helper.success(undefined);
    }

    private compile(context: DocumentContext): ParseResult<Alternation> {
        const helper = new ParseHelper();

        if (this.alternationTexts.length === 0) { // implicit
            const implicitIndex = max(context.documentState.definedAlternationIndices) + 1;
            const alternation = new Alternation();
            alternation.range = this.range;
            alternation.textType = context.documentState.alternationTextType === undefined
                ? AlternationText.Type.Arabic
                : context.documentState.alternationTextType;
            alternation.explicity = Explicity.Implicit;
            alternation.indices = [implicitIndex];

            return helper.success(alternation);
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
                helper.warning(alternationText.range, Messages.Warning_InconsistentAlternationTextType);
            } else {
                referenceTextType = result.type;
            }

            if (context.documentState.definedAlternationIndices.contains(result.index)) {
                return helper.fail(alternationText.range, Messages.Error_DuplicatedAlternationText, alternationText.value);
            }

            indices.push(result.index);
        }

        element.textType = referenceTextType;
        element.indices = indices;
        return helper.success(element);
    }
}

export module AlternateDirectiveNode {

    export function parseBody(scanner: Scanner): ParseResult<AlternateDirectiveNode> {

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