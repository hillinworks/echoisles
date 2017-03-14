import { RhythmSegmentNodeBase } from "./RhythmSegmentNodeBase";
import { ILogger } from "../../Core/Logging/ILogger";
import { DocumentContext } from "../DocumentContext";
import { RhythmTemplateSegment } from "../../Core/Sheet/RhythmTemplateSegment";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";

export class RhythmTemplateSegmentNode extends RhythmSegmentNodeBase {

    constructor(range?: TextRange) {
        super(range);
    }

    toDocumentElement(context: DocumentContext, logger: ILogger): RhythmTemplateSegment | undefined {
        const element = new RhythmTemplateSegment();
        element.range = this.range;
        if (!this.fillRhythmSegmentVoices(context, logger, element))
            return undefined;

        return element;
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
    export function parse(scanner: Scanner, optionalBrackets = false): IParseResult<RhythmTemplateSegmentNode> {
        const node = new RhythmTemplateSegmentNode();
        const baseParseResult = RhythmSegmentNodeBase.parseRhythmDefinition(scanner, node, optionalBrackets);
        if (!ParseHelper.isSuccessful(baseParseResult)) {
            return ParseHelper.relayState(baseParseResult);
        }

        return ParseHelper.success(node, ...baseParseResult.messages);
    }
}