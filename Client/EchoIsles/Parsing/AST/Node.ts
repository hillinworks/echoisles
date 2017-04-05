import { TextRange } from "../../Core/Parsing/TextRange";
import { DocumentContext } from "../DocumentContext";
import { ParseResultMaybeEmpty, ParseHelper } from "../ParseResult";

export abstract class Node {

    range: TextRange;

    constructor(range?: TextRange) {

    }

    apply(context: DocumentContext): ParseResultMaybeEmpty<void> {
        return ParseHelper.voidSuccess;
    }
}