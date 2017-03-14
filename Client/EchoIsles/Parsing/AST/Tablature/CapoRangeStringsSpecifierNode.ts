import { CapoStringsSpecifierNode } from "./CapoStringsSpecifierNode";
import { LiteralNode } from "../LiteralNode";

export class CapoRangeStringsSpecifierNode extends CapoStringsSpecifierNode {
    from: LiteralNode<number>;
    to: LiteralNode<number>;

    constructor(from: LiteralNode<number>, to: LiteralNode<number>) {
        super(from.range.union(to.range));
        this.from = from;
        this.to = to;
    }

    get stringNumbers(): number[] {
        return new Array(this.to.value - this.from.value + 1).map((_, i) => i + this.from.value);
    }
}