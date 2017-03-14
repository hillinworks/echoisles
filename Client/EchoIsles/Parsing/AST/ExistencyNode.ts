﻿import { Node } from "./Node";
import { Scanner } from "../Scanner";

import { TextRange } from "../../Core/Parsing/TextRange";
import { IParseResult, ParseHelper } from "../ParseResult";

export class ExistencyNode extends Node {

    constructor(range?: TextRange) {
        super(range);
    }

}

export module ExistencyNode {
    export function parseCharExistency(scanner: Scanner, char: string): IParseResult<ExistencyNode> {
        if (scanner.expectChar(char)) {
            return ParseHelper.success(new ExistencyNode(scanner.lastReadRange));
        }

        return ParseHelper.fail();
    }
}