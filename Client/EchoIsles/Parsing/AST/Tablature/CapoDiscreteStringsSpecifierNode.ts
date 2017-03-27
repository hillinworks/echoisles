import { CapoStringsSpecifierNode } from "./CapoStringsSpecifierNode";
import { LiteralNode } from "../LiteralNode";
import { TextRange } from "../../../Core/Parsing/TextRange";
import { L } from "../../../Core/Utilities/LinqLite";

export class CapoDiscreteStringsSpecifierNode extends CapoStringsSpecifierNode {
    readonly strings = new Array<LiteralNode<number>>();

    constructor(range?: TextRange) {
        super(range);
    }

    get stringNumbers(): number[] {
        return L(this.strings).select(s => s.value).toArray();
    }
}