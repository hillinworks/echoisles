import { TopLevelNode } from "./TopLevelNode";
import { LiteralNode } from "./LiteralNode";

export abstract class DirectiveNode extends TopLevelNode {
    nameNode: LiteralNode<string>;
}
