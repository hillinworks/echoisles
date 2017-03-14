import { ILogger } from "../../Core/Logging/ILogger";
import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";
import { DocumentContext } from "../DocumentContext";
import { Section } from "../../Core/Sheet/Section";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { Scanner, ParenthesisReadResult } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";

export class SectionDirectiveNode extends DirectiveNode {
    sectionName: LiteralNode<string>;

    apply(context: DocumentContext, logger: ILogger): boolean {
        const result = this.toDocumentElement(context, logger);
        if (!result)
            return false;

        context.alterDocumentState(state => {
            const section = result as Section;
            state.definedSections.add(section);
            state.currentSection = section;
        });

        return true;
    }

    private toDocumentElement(context: DocumentContext, logger: ILogger): Section | undefined {
        if (context.documentState.definedSections.any(this.valueEquals)) {
            logger.report(LogLevel.Warning,
                this.range,
                Messages.Warning_DuplicatedSectionName,
                this.sectionName.value);
            return undefined;
        }

        const element = new Section();
        element.range = this.range;
        element.name = this.sectionName.value;

        return element;
    }

    private valueEquals(section: Section): boolean {
        return this.sectionName.value.toUpperCase() === section.name.toUpperCase();
    }
}

export module SectionDirectiveNode {
    export function parseBody(scanner: Scanner): IParseResult<SectionDirectiveNode> {

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