import { CapoStringsSpecifierNode } from "./CapoStringsSpecifierNode";
import { LiteralNode } from "../LiteralNode";
import { ISequence } from "../../../Core/Utilities/LinqLite";

export class CapoRangeStringsSpecifierNode extends CapoStringsSpecifierNode {
    from: LiteralNode<number>;
    to: LiteralNode<number>;

    constructor(from: LiteralNode<number>, to: LiteralNode<number>) {
        super(from.range.union(to.range));
        this.from = from;
        this.to = to;
    }

    get stringNumbers(): number[] {
        return ISequence.range(this.from.value, this.to.value - this.from.value + 1).toArray();
    }
}