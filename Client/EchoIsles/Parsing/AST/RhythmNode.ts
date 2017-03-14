import { Node } from "./Node";
import { DocumentContext } from "../DocumentContext";
import { ILogger } from "../../Core/Logging/ILogger";
import { RhythmSegmentNode } from "./RhythmSegmentNode";
import { Rhythm } from "../../Core/Sheet/Rhythm";
import { PreciseDuration } from "../../Core/MusicTheory/PreciseDuration";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { Messages } from "../Messages";
import { TextRange } from "../../Core/Parsing/TextRange";

export class RhythmNode extends Node {
    segments = new Array<RhythmSegmentNode>();

    constructor(range?: TextRange) {
        super(range);
    }

    toDocumentElement(context: DocumentContext, logger: ILogger): Rhythm | undefined {
        const rhythm = new Rhythm();
        rhythm.range = this.range;

        let duration = PreciseDuration.zero;

        for (let segment of this.segments) {
            const result = segment.toDocumentElement(context, logger);
            if (!result) {
                return undefined;
            }

            rhythm.segments.push(result!);
            duration = duration.add(segment.duration);
        }

        // duration could be 0 if rhythm is not defined (only chord defined), rhythm will be determined by the rhythm instruction
        if (duration.compareTo(0) > 0 && duration.equals(context.documentState.time.duration)) {
            logger.report(LogLevel.Warning, this.range, Messages.Warning_BeatsNotMatchingTimeSignature);
            rhythm.notMatchingTime = true;
        }

        return rhythm;
    }
}

export module RhythmNode {

    function isEndOfRhythm(scanner: Scanner): boolean {
        return scanner.peekChar() === "@";
    }

    export function parse(scanner: Scanner, endOfBarPredicate: Scanner.Predicate): IParseResult<RhythmNode> {
        const node = new RhythmNode();

        scanner.skipWhitespaces();

        const anchor = scanner.makeAnchor();

        while (!isEndOfRhythm(scanner) && !endOfBarPredicate(scanner)) {
            const segment = RhythmSegmentNode.parse(scanner);
            if (!ParseHelper.isSuccessful(segment)) {
                return ParseHelper.relayState(segment);
            }

            node.segments.push(segment.value!);
            scanner.skipWhitespaces(false);
        }

        node.range = anchor.range;

        return ParseHelper.success(node);
    }

}