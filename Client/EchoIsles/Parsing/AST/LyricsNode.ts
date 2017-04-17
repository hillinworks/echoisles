import { Node } from "./Node";
import { Lyrics } from "../../Core/Sheet/Lyrics";
import { LyricsSegmentNode } from "./LyricsSegmentNode";
import { DocumentContext } from "../DocumentContext";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper, IParseSuccessResult } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";

export class LyricsNode extends Node {
    readonly lyricsSegments = new Array<LyricsSegmentNode>();

    constructor(range?: TextRange) {
        super(range);
    }

    compile(context: DocumentContext): ParseResult<Lyrics> {
        const helper = new ParseHelper();
        const lyrics = new Lyrics();
        lyrics.range = this.range;

        for (let segment of this.lyricsSegments) {
            const result = helper.absorb(segment.compile(context));
            if (!ParseHelper.isSuccessful(result)) {
                return helper.fail();
            }

            lyrics.segments.push(result.value);
        };

        return helper.success(lyrics);
    }
}

export module LyricsNode {


    export function parse(scanner: Scanner, endOfBarPredicate: Scanner.Predicate): IParseSuccessResult<LyricsNode> {
        const helper = new ParseHelper();
        const anchor = scanner.makeAnchor();
        scanner.expectChar("@");
        scanner.skipWhitespaces();

        const node = new LyricsNode();

        function isEndOfLyrics(scanner: Scanner) {
            return endOfBarPredicate(scanner) || scanner.isEndOfLine;
        }

        while (!isEndOfLyrics(scanner)) {
            const segment = ParseHelper.assert(LyricsSegmentNode.parse(scanner, isEndOfLyrics));
            node.lyricsSegments.push(segment.value);
        }

        for (let i = node.lyricsSegments.length - 1; i >= 0; --i) {
            if (node.lyricsSegments[i].text.value.length === 0) {
                node.lyricsSegments.splice(i, 1);
            } else {
                break;
            }
        }

        node.range = anchor.range;
        return helper.success(node);
    }

}