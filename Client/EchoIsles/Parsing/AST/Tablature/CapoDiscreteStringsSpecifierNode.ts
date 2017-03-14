import { CapoStringsSpecifierNode } from "./CapoStringsSpecifierNode";
import { LiteralNode } from "../LiteralNode";
import { TextRange } from "../../../Core/Parsing/TextRange";

export class CapoDiscreteStringsSpecifierNode extends CapoStringsSpecifierNode {
    readonly strings = new Array<LiteralNode<number>>();

    constructor(range?: TextRange) {
        super(range);
    }

    get stringNumbers(): number[] {
        return this.strings.map(s => s.value);
    }
}