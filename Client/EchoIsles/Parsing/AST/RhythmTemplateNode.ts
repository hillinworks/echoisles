import { Node } from "./Node";
import { RhythmTemplateSegmentNode } from "./RhythmTemplateSegmentNode";
import { RhythmTemplate } from "../../Core/Sheet/RhythmTemplate";
import { DocumentContext } from "../DocumentContext";
import { ILogger } from "../../Core/Logging/ILogger";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";

export class RhythmTemplateNode extends Node {
    readonly segments = new Array<RhythmTemplateSegmentNode>();

    constructor(range?: TextRange) {
        super(range);
    }

    toDocumentElement(context: DocumentContext, logger: ILogger): RhythmTemplate | undefined {
        const element = new RhythmTemplate();
        element.range = this.range;

        for (let segment of this.segments) {
            const result = segment.toDocumentElement(context, logger);
            if (!result)
                return undefined;

            element.segments.push(result!);
        }

        return element;
    }

    valueEquals(other: RhythmTemplate) {
        if (other === undefined)
            return false;

        if (other.segments.length !== this.segments.length)
            return false;

        for (let i = 0; i < this.segments.length; ++i) {
            if (!this.segments[i].valueEquals(other.segments[i]))
                return false;
        }

        return true;
    }
}

export module RhythmTemplateNode {

    export function parse(scanner: Scanner): IParseResult<RhythmTemplateNode> {
        const node = new RhythmTemplateNode();

        scanner.skipWhitespaces();

        const anchor = scanner.makeAnchor();

        if (scanner.peekChar() !== "[") { // handle optional brackets
            const segment = RhythmTemplateSegmentNode.parse(scanner, true);
            if (!ParseHelper.isSuccessful(segment)) {
                return ParseHelper.relayState(segment);
            }

            node.segments.push(segment.value!);
            node.range = anchor.range;
            return ParseHelper.success(node);
        }

        while (!scanner.isEndOfLine) {
            const segment = RhythmTemplateSegmentNode.parse(scanner, false);
            if (!ParseHelper.isSuccessful(segment)) {
                return ParseHelper.relayState(segment);
            }

            node.segments.push(segment.value!);
            scanner.skipWhitespaces();
        }

        node.range = anchor.range;
        return ParseHelper.success(node);
    }

}