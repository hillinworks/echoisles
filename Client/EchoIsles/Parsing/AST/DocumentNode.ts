import { Node } from "./Node";
import { Scanner } from "../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../ParseResult";
import { BarNode } from "./BarNode";
import { DirectiveNodeParser } from "./DirectiveNodeParser";
import { TablatureContext } from "../Tablature/TablatureContext";
import { Document } from "../../Core/Sheet/Document";
import { TopLevelNode } from "./TopLevelNode";
import { Messages } from "../Messages";
import { BarLine } from "../../Core/MusicTheory/BarLine";

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

        const validateResult = helper.absorb(this.validate(context));
        if (ParseHelper.isFailed(validateResult)) {
            return helper.fail();
        }

        return helper.success(context.toDocument());
    }

    private validate(context: TablatureContext): ParseResult<void> {
        const helper = new ParseHelper();

        // check bar lines of first and last bar
        if (context.bars.length > 0) {

            const firstBar = context.bars[0];
            if (firstBar.openLine === undefined) {
                helper.suggestion(firstBar.range!.from.asRange(firstBar.range!.source),
                    Messages.Suggestion_FirstOpenBarLineMissing);
                firstBar.openLine = BarLine.Standard;
            }

            const lastBar = context.bars[context.bars.length - 1];
            if (lastBar.closeLine === undefined) {
                helper.suggestion(lastBar.range!.to.asRange(lastBar.range!.source),
                    Messages.Suggestion_LastCloseBarLineMissing);
                lastBar.closeLine = BarLine.End;
            } else if (lastBar.closeLine === BarLine.Standard) {
                helper.warning(lastBar.range!.to.asRange(lastBar.range!.source),
                    Messages.Warning_InappropriateCloseBarLine);
                lastBar.closeLine = BarLine.End;
            } else if (lastBar.closeLine === BarLine.Double) {
                lastBar.closeLine = BarLine.End;
            }
        }

        return helper.voidSuccess();
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