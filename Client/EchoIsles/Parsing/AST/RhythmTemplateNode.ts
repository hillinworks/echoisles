import { Node } from "./Node";
import { RhythmTemplateSegmentNode } from "./RhythmTemplateSegmentNode";
import { RhythmTemplate } from "../../Core/Sheet/RhythmTemplate";
import { DocumentContext } from "../DocumentContext";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";

export class RhythmTemplateNode extends Node {
    readonly segments = new Array<RhythmTemplateSegmentNode>();

    constructor(range?: TextRange) {
        super(range);
    }

    compile(context: DocumentContext): ParseResult<RhythmTemplate> {
        const element = new RhythmTemplate();
        element.range = this.range;

        for (let segment of this.segments) {
            const result = segment.compile(context);
            if (!ParseHelper.isSuccessful(result)) {
                return ParseHelper.relayFailure(result);
            }

            element.segments.push(result.value);
        }

        return ParseHelper.success(element);
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

    export function parse(scanner: Scanner): ParseResult<RhythmTemplateNode> {
        const node = new RhythmTemplateNode();

        scanner.skipWhitespaces();

        const anchor = scanner.makeAnchor();

        if (scanner.peekChar() !== "[") { // handle optional brackets
            const segment = RhythmTemplateSegmentNode.parse(scanner, true);
            if (!ParseHelper.isSuccessful(segment)) {
                return ParseHelper.relayFailure(segment);
            }

            node.segments.push(segment.value!);
            node.range = anchor.range;
            return ParseHelper.success(node);
        }

        while (!scanner.isEndOfLine) {
            const segment = RhythmTemplateSegmentNode.parse(scanner, false);
            if (!ParseHelper.isSuccessful(segment)) {
                return ParseHelper.relayFailure(segment);
            }

            node.segments.push(segment.value!);
            scanner.skipWhitespaces();
        }

        node.range = anchor.range;
        return ParseHelper.success(node);
    }

}