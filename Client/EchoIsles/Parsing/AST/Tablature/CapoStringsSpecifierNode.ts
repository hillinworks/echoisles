import { Node } from "../Node"

export abstract class CapoStringsSpecifierNode extends Node {
    abstract get stringNumbers(): number[];
}
