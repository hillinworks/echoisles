import { Node } from "./Node";
import { DocumentContext } from "../DocumentContext";
import { ParseResultMaybeEmpty } from "../ParseResult";

export abstract class TopLevelNode extends Node {
    abstract apply(context: DocumentContext): ParseResultMaybeEmpty<void>;
}