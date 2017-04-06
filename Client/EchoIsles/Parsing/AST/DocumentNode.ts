import { Node } from "./Node";
import { Scanner } from "../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../ParseResult";
import { BarNode } from "./BarNode";
import { DirectiveNodeParser } from "./DirectiveNodeParser";
import { TablatureContext } from "../Tablature/TablatureContext";
import { Document } from "../../Core/Sheet/Document";
import { TopLevelNode } from "./TopLevelNode";

export class DocumentNode extends Node {
    nodes = new Array<TopLevelNode>();

    compile(): ParseResult<Document> {
        const helper = new ParseHelper();
        const context = new TablatureContext();
        for (let node of this.nodes) {
            const applyResult = helper.absorb(node.apply(context));
            if (ParseHelper.isFailed(applyResult)) {
                return helper.fail();
            }
        }

        return helper.success(context.toDocument());
    }
}

export module DocumentNode {

    function parseNode(scanner: Scanner): ParseResultMaybeEmpty<TopLevelNode> {
        scanner.skipWhitespaces(false);
        if (scanner.isEndOfInput) {
            return ParseHelper.empty();
        }

        if (scanner.peekChar() === "+") {
            return DirectiveNodeParser.parse(scanner);
        }

        return BarNode.parse(scanner, false);
    }

    export function parse(scanner: Scanner): ParseResult<DocumentNode> {
        const anchor = scanner.makeAnchor();
        const document = new DocumentNode();
        const helper = new ParseHelper();

        while (!scanner.isEndOfInput) {
            const node = helper.absorb(parseNode(scanner));
            if (ParseHelper.isSuccessful(node)) {
                document.nodes.push(node.value);
            } else {
                return helper.fail();
            }
        }

        document.range = anchor.range;

        return helper.success(document);
    }
}