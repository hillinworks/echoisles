import { TextRange } from "../../Core/Parsing/TextRange";
import { DocumentContext } from "../DocumentContext";
import { ILogger } from "../../Core/Logging/ILogger";

export abstract class Node {
    range: TextRange;

    constructor(range?: TextRange) {
        if (range) {
            this.range = range;
        }
    }

    /* abstract */ apply(context: DocumentContext, logger: ILogger): boolean {
        return true;
    }
}