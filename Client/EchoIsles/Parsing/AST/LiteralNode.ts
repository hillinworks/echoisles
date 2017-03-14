import { Node } from "./Node";
import { TextRange } from "../../Core/Parsing/TextRange";

export class LiteralNode<T> extends Node {
    value: T;

    constructor(value: T, range: TextRange) {
        super();
        this.value = value;
        this.range = range;
    }

    toString(): string {
        return this.value.toString();
    }
}

export module LiteralNode {

    export function valueOrUndefined<T>(node: LiteralNode<T> | undefined): T | undefined {
        if (node === undefined) {
            return undefined;
        }

        return node.value;
    }

    export function valueOrDefault<T>(node: LiteralNode<T> | undefined, defaultValue: T): T {
        if (node === undefined) {
            return defaultValue;
        }

        return node.value;
    }

    export function create<T>(value: T, range: TextRange) {
        return new LiteralNode<T>(value, range);
    }

}