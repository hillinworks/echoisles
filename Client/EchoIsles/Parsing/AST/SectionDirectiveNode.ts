import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";
import { DocumentContext } from "../DocumentContext";
import { Section } from "../../Core/Sheet/Section";
import { Messages } from "../Messages";
import { Scanner, ParenthesisReadResult } from "../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../ParseResult";
import { any } from "../../Core/Utilities/LinqLite";

export class SectionDirectiveNode extends DirectiveNode {
    sectionName: LiteralNode<string>;

    apply(context: DocumentContext): ParseResultMaybeEmpty<void> {
        const helper = new ParseHelper();
        const result = helper.absorb(this.compile(context));
        if (!ParseHelper.isSuccessful(result)) {
            return helper.fail();
        }

        context.alterDocumentState(state => {
            state.definedSections.add(result.value);
            state.currentSection = result.value;
        });

        return helper.voidSuccess();
    }

    private compile(context: DocumentContext): ParseResultMaybeEmpty<Section> {
        const helper = new ParseHelper();

        if (any(context.documentState.definedSections, s => this.valueEquals(s))) {
            helper.warning(this.range, Messages.Warning_DuplicatedSectionName, this.sectionName.value);
            return helper.empty();
        }

        const element = new Section();
        element.range = this.range;
        element.name = this.sectionName.value;

        return helper.success(element);
    }

    private valueEquals(section: Section): boolean {
        return this.sectionName.value.toUpperCase() === section.name.toUpperCase();
    }
}

export module SectionDirectiveNode {
    export function parseBody(scanner: Scanner): ParseResult<SectionDirectiveNode> {

        const helper = new ParseHelper();

        scanner.skipOptional(":", true);

        const quoteChar = "\"";

        let sectionName: string;
        if (scanner.peekChar() === quoteChar) {
            const parenthesis = scanner.readParenthesis(quoteChar, quoteChar, false, false);
            if (parenthesis.result === ParenthesisReadResult.MissingClose) {
                helper.warning(scanner.lastReadRange, Messages.Warning_SectionNameMissingCloseQuoteMark);
            }
            sectionName = parenthesis.text!;
        } else {
            sectionName = scanner.readToLineEnd();
        }

        sectionName = sectionName.trim();
        if (sectionName.length === 0) {
            helper.warning(scanner.lastReadRange, Messages.Warning_EmptySectionName);
        }

        const node = new SectionDirectiveNode();
        node.sectionName = LiteralNode.create(sectionName, scanner.lastReadRange);
        return helper.success(node);
    }
}
