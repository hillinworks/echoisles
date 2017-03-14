import { Node } from "./Node";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { BarNode } from "./BarNode";
import { DirectiveNodeParser } from "./DirectiveNodeParser";

export class DocumentNode extends Node {
    nodes = new Array<Node>();
}

export module DocumentNode {

    function parseNode(scanner: Scanner): IParseResult<Node> {
        scanner.skipWhitespaces(false);
        if (scanner.isEndOfInput) {
            return ParseHelper.empty();
        }

        if (scanner.peekChar() === "+") {
            return DirectiveNodeParser.parse(scanner);
        }

        return BarNode.parse(scanner, false);
    }

    export function parse(scanner: Scanner): IParseResult<DocumentNode> {
        const anchor = scanner.makeAnchor();
        const document = new DocumentNode();
        const helper = new ParseHelper();

        while (!scanner.isEndOfInput) {
            const node = parseNode(scanner);
            if (ParseHelper.isSuccessful(node)) {
                helper.absorb(node);
                document.nodes.push(node.value!);
            } else {
                return helper.relayFailure(node);
            }
        }

        document.range = anchor.range;

        return helper.success(document);
    }
}