import { Node } from "./Node";
import { DocumentContext } from "../DocumentContext";
import { ILogger } from "../../Core/Logging/ILogger";
import { BarNode } from "./BarNode";
import { DirectiveNode } from "./DirectiveNode";
import { Bar } from "../../Core/Sheet/Bar";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";
import { BarLine } from "../../Core/MusicTheory/BarLine";

class TemplateBarsNode extends Node {
    readonly bars = new Array<BarNode>();
}

class InstanceBarsNode extends Node {
    readonly bars = new Array<BarNode>();
}

export class PatternDirectiveNode extends DirectiveNode {
    templateBars: TemplateBarsNode;
    instanceBars: InstanceBarsNode;

    constructor(range?: TextRange) {
        super(range);
    }

    apply(context: DocumentContext, logger: ILogger): boolean {
        const templateBarNodes = this.templateBars.bars;
        const instanceBarNodes = this.instanceBars.bars;

        if (instanceBarNodes.length < templateBarNodes.length) {
            logger.report(LogLevel.Warning,
                this.instanceBars.range,
                Messages.Warning_PatternInstanceBarsLessThanTemplateBars);
        }

        const templateBars = new Array<Bar>();
        for (let barNode of templateBarNodes) {
            if (barNode.lyrics != null) {
                logger.report(LogLevel.Warning,
                    barNode.lyrics.range,
                    Messages.Warning_TemplateBarCannotContainLyrics);
            }

            const result = barNode.toDocumentElement(context, logger, undefined);
            if (!result) {
                return false;
            }

            templateBars.push(result!);
        }

        let templateIndex = 0;
        for (let barNode of instanceBarNodes) {
            const templateBar = templateBars[templateIndex];

            if (!barNode) {
                context.addBar(templateBar);
            } else {
                const result = barNode.toDocumentElement(context, logger, templateBar);
                if (result) {
                    context.addBar(result);
                }
            }

            ++templateIndex;
            if (templateIndex === templateBarNodes.length) {
                templateIndex = 0;
            }

        }

        return true;
    }

}

export module PatternDirectiveNode {
    export function parseBody(scanner: Scanner): IParseResult<PatternDirectiveNode> {

        const node = new PatternDirectiveNode();
        const helper = new ParseHelper();

        scanner.skipWhitespaces();
        scanner.skipOptional(":", false);
        scanner.skipWhitespaces(false); // allow a new line here

        let anchor = scanner.makeAnchor();
        node.templateBars = new TemplateBarsNode();

        while (!scanner.isEndOfInput) {
            const bar = BarNode.parse(scanner, false);
            if (!ParseHelper.isSuccessful(bar)) {
                return helper.relayFailure(bar);
            }

            node.templateBars.bars.push(bar.value!);

            scanner.skipWhitespaces(false);

            if (scanner.peekChar() === "{") {
                break;
            }
        }

        node.templateBars.range = anchor.range;

        for (const bar of node.templateBars.bars) {
            if (bar.openLine && bar.openLine.value !== BarLine.Standard) {
                return helper.fail(bar.openLine.range, Messages.Error_InvalidBarLineInPattern);
            }

            if (bar.closeLine && bar.closeLine.value !== BarLine.Standard) {
                return helper.fail(bar.closeLine.range, Messages.Error_InvalidBarLineInPattern);
            }
        }

        if (!scanner.expectChar("{")) {
            return helper.fail(scanner.lastReadRange, Messages.Error_PatternInstanceBarsExpected);
        }

        scanner.skipWhitespaces(false);

        anchor = scanner.makeAnchor();
        node.instanceBars = new InstanceBarsNode();

        while (!scanner.isEndOfInput && scanner.peekChar() !== "}") {
            const bar = BarNode.parse(scanner, true);
            if (!ParseHelper.isSuccessful(bar)) {
                return helper.relayFailure(bar);
            }

            node.instanceBars.bars.push(bar.value!);

            scanner.skipWhitespaces(false);
        }

        node.instanceBars.range = anchor.range;

        if (!scanner.expectChar("}")) {
            helper.warning(scanner.lastReadRange, Messages.Warning_PatternBodyNotEnclosed);
        }

        return helper.success(node);
    }
}