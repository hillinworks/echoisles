import { RhythmSegmentNodeBase } from "./RhythmSegmentNodeBase";
import { DocumentContext } from "../DocumentContext";
import { RhythmTemplateSegment } from "../../Core/Sheet/RhythmTemplateSegment";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";

export class RhythmTemplateSegmentNode extends RhythmSegmentNodeBase {

    constructor(range?: TextRange) {
        super(range);
    }

    compile(context: DocumentContext): ParseResult<RhythmTemplateSegment> {
        const element = new RhythmTemplateSegment();
        element.range = this.range;
        const fillRhythmSegmentVoicesResult = this.fillRhythmSegmentVoices(context, element);
        if (!ParseHelper.isSuccessful(fillRhythmSegmentVoicesResult)) {
            return ParseHelper.relayFailure(fillRhythmSegmentVoicesResult);
        }

        return ParseHelper.success(element);
    }

    valueEquals(other: RhythmTemplateSegment): boolean {
        if (other === undefined)
            return false;

        if (this.bassVoice !== undefined && other.bassVoice !== undefined)
            if (!this.bassVoice.valueEquals(other.bassVoice))
                return false;

        if (this.bassVoice !== undefined || other.bassVoice !== undefined)
            return false;

        if (this.trebleVoice !== undefined && other.trebleVoice !== undefined)
            if (!this.trebleVoice.valueEquals(other.trebleVoice))
                return false;

        if (this.trebleVoice !== undefined || other.trebleVoice !== undefined)
            return false;

        return true;
    }
}

export module RhythmTemplateSegmentNode {
    export function parse(scanner: Scanner, optionalBrackets = false): ParseResult<RhythmTemplateSegmentNode> {
        const node = new RhythmTemplateSegmentNode();
        const baseParseResult = RhythmSegmentNodeBase.parseRhythmDefinition(scanner, node, optionalBrackets);
        if (!ParseHelper.isSuccessful(baseParseResult)) {
            return ParseHelper.relayFailure(baseParseResult);
        }

        return ParseHelper.success(node, ...baseParseResult.messages);
    }
}