import { Node } from "./Node";
import { ILogger } from "../../Core/Logging/ILogger";
import { Lyrics } from "../../Core/Sheet/Lyrics";
import { LyricsSegmentNode } from "./LyricsSegmentNode";
import { DocumentContext } from "../DocumentContext";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { assert } from "../../Core/Utilities/Debug";
import { TextRange } from "../../Core/Parsing/TextRange";

export class LyricsNode extends Node {
    readonly lyricsSegments = new Array<LyricsSegmentNode>();

    constructor(range?: TextRange) {
        super(range);
    }

    toDocumentElement(context: DocumentContext, logger: ILogger): Lyrics | undefined {
        const lyrics = new Lyrics();
        lyrics.range = this.range;

        for (let segment of this.lyricsSegments) {
            const result = segment.toDocumentElement(context, logger);
            if (!result) {
                return undefined;
            }

            lyrics.segments.push(result!);
        };

        return lyrics;
    }
}

export module LyricsNode {


    export function parse(scanner: Scanner, endOfBarPredicate: Scanner.Predicate): IParseResult<LyricsNode> {
        const anchor = scanner.makeAnchor();
        scanner.expectChar("@");
        scanner.skipWhitespaces();

        const node = new LyricsNode();

        function isEndOfLyrics(scanner: Scanner) {
            return endOfBarPredicate(scanner) || scanner.isEndOfLine;
        }

        while (!isEndOfLyrics(scanner)) {
            const segment = LyricsSegmentNode.parse(scanner, isEndOfLyrics);
            assert(ParseHelper.isSuccessful(segment), "LyricsSegmentNode.parse() should not return false");
            node.lyricsSegments.push(segment.value!);
        }

        for (let i = node.lyricsSegments.length - 1; i >= 0; --i) {
            if (node.lyricsSegments[i].text.value.length === 0) {
                node.lyricsSegments.splice(i, 1);
            } else {
                break;
            }
        }

        node.range = anchor.range;
        return ParseHelper.success(node);
    }

}