import { Scanner } from "./Scanner";
import { DocumentNode } from "./AST/DocumentNode";
import { ParseResult, ParseHelper } from "./ParseResult";
import { Document } from "../Core/Sheet/Document";

export module Parser {
    export function parse(source: string): ParseResult<Document> {
        const helper = new ParseHelper();
        const scanner = new Scanner(source);
        const parseResult = helper.absorb(DocumentNode.parse(scanner));
        if (!ParseHelper.isSuccessful(parseResult)) {
            return helper.fail();
        }

        const compileResult = helper.absorb(parseResult.value.compile());
        if (!ParseHelper.isSuccessful(compileResult)) {
            return helper.fail();
        }

        return helper.success(compileResult.value);
    }
}