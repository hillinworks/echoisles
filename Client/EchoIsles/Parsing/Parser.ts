import { Scanner } from "./Scanner";
import { DocumentNode } from "./AST/DocumentNode";
import { IParseResult } from "./ParseResult";

export module Parser {
    export function parse(source: string): IParseResult<DocumentNode> {
        const scanner = new Scanner(source);
        return DocumentNode.parse(scanner);
    }
}