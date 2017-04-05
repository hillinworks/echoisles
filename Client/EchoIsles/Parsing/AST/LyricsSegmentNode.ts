import { Node } from "./Node";
import { LiteralNode } from "./LiteralNode";
import { LyricsSegment } from "../../Core/Sheet/LyricsSegment";
import { TextRange } from "../../Core/Parsing/TextRange";
import { DocumentContext } from "../DocumentContext";
import { Scanner, ParenthesisReadResult } from "../Scanner";
import { ParseResult, ParseHelper, IParseSuccessResult } from "../ParseResult";
import { LogMessage } from "../../Core/Logging/LogMessage";
import { Messages } from "../Messages";
import { StringBuilder } from "../../Core/Utilities/StringBuilder";
import { StringUtilities } from "../../Core/Utilities/StringUtilities";

export class LyricsSegmentNode extends Node {
    text: LiteralNode<string>;

    constructor(text: string, range: TextRange) {
        super(range);
        this.text = new LiteralNode<string>(text, range);
        this.range = range;
    }

    compile(context: DocumentContext): IParseSuccessResult<LyricsSegment> {
        const segment = new LyricsSegment();
        segment.range = this.range;
        segment.text = this.text.value;
        return ParseHelper.success(segment);
    }
}

export module LyricsSegmentNode {

    export function parse(scanner: Scanner, endOfLyricsPredicate: Scanner.Predicate): ParseResult<LyricsSegmentNode> {
        const builder = new StringBuilder();
        const anchor = scanner.makeAnchor();

        function success() {
            return ParseHelper.success(new LyricsSegmentNode(builder.toString(), anchor.range));
        }

        if (scanner.peekChar() === "(") {
            const parenthesis = scanner.readParenthesis();
            switch (parenthesis.result) {
                case ParenthesisReadResult.Success:
                    return ParseHelper.success(new LyricsSegmentNode(parenthesis.text!, scanner.lastReadRange));
                case ParenthesisReadResult.MissingClose:
                    return ParseHelper.success(new LyricsSegmentNode(parenthesis.text!, scanner.lastReadRange),
                        LogMessage.warning(scanner.lastReadRange, Messages.Warning_TiedLyricsNotEnclosed));
                default:
                    throw new Error();  // should not reach here
            }
        }

        while (!endOfLyricsPredicate(scanner)) {
            const char = scanner.readChar();

            if (StringUtilities.isWhitespaceChar(char)) {
                return success();
            }

            if (char === "-") {
                if (builder.hasContent) {
                    if (StringUtilities.isWhitespaceChar(scanner.peekChar())) {
                        return success();
                    }

                    builder.append(char);
                    return success();
                }

                return success();   // empty
            }

            builder.append(char);
        }

        return success();
    }

}