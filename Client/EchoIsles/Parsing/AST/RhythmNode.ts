import { Node } from "./Node";
import { DocumentContext } from "../DocumentContext";
import { RhythmSegmentNode } from "./RhythmSegmentNode";
import { Rhythm } from "../../Core/Sheet/Rhythm";
import { PreciseDuration } from "../../Core/MusicTheory/PreciseDuration";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper } from "../ParseResult";
import { Messages } from "../Messages";
import { TextRange } from "../../Core/Parsing/TextRange";

export class RhythmNode extends Node {
    segments = new Array<RhythmSegmentNode>();

    constructor(range?: TextRange) {
        super(range);
    }

    compile(context: DocumentContext): ParseResult<Rhythm> {
        const helper = new ParseHelper();
        const rhythm = new Rhythm();
        rhythm.range = this.range;

        let duration = PreciseDuration.zero;

        for (let segment of this.segments) {
            const result = helper.absorb(segment.compile(context));
            if (!ParseHelper.isSuccessful(result)) {
                return helper.fail();
            }

            rhythm.segments.push(result.value);
            duration = duration.add(segment.duration);
        }

        // duration could be 0 if rhythm is not defined (only chord defined), rhythm will be determined by the rhythm instruction
        if (duration.compareTo(0) > 0 && duration.equals(context.documentState.time.duration)) {
            helper.warning(this.range, Messages.Warning_BeatsNotMatchingTimeSignature);
            rhythm.notMatchingTime = true;
        }

        return helper.success(rhythm);
    }
}

export module RhythmNode {

    function isEndOfRhythm(scanner: Scanner): boolean {
        return scanner.peekChar() === "@";
    }

    export function parse(scanner: Scanner, endOfBarPredicate: Scanner.Predicate): ParseResult<RhythmNode> {
        const helper = new ParseHelper();
        const node = new RhythmNode();

        scanner.skipWhitespaces();

        const anchor = scanner.makeAnchor();

        while (!isEndOfRhythm(scanner) && !endOfBarPredicate(scanner)) {
            const segment = helper.absorb(RhythmSegmentNode.parse(scanner));
            if (!ParseHelper.isSuccessful(segment)) {
                return helper.fail();
            }

            node.segments.push(segment.value);
            scanner.skipWhitespaces(false);
        }

        node.range = anchor.range;

        return helper.success(node);
    }

}