import { Scanner } from "../../Scanner";
import { ParseResult, ParseHelper } from "../../ParseResult";
import { TextRange } from "../../../Core/Parsing/TextRange";
import { Defaults } from "../../../Core/Sheet/Tablature/Defaults";
import { Messages } from "../../Messages";
import { CapoRangeStringsSpecifierNode } from "./CapoRangeStringsSpecifierNode";
import { LiteralNode } from "../LiteralNode";
import { CapoDiscreteStringsSpecifierNode } from "./CapoDiscreteStringsSpecifierNode";
import { CapoStringsSpecifierNode } from "./CapoStringsSpecifierNode";
import { any } from "../../../Core/Utilities/LinqLite";

export module CapoStringsSpecifierNodeParser {
    export function parse(scanner: Scanner): ParseResult<CapoStringsSpecifierNode> {

        const helper = new ParseHelper();

        scanner.expectChar("(");
        scanner.skipWhitespaces();

        let node: CapoStringsSpecifierNode;

        const anchor = scanner.makeAnchor();
        const match = scanner.match("(\\d)\\s*-\\s*(\\d)");
        if (match) {

            const from = parseInt(match[1]);
            if (from === 0 || from > Defaults.strings) {
                return helper.fail(scanner.lastReadRange, Messages.Error_CapoStringsSpecifierInvalidStringNumber);
            }

            const fromRange = new TextRange(anchor.from, match[1].length, scanner.source);

            const to = parseInt(match[2]);
            if (to === 0 || to > Defaults.strings) {
                return helper.fail(scanner.lastReadRange, Messages.Error_CapoStringsSpecifierInvalidStringNumber);
            }

            const toRange = new TextRange(scanner.textPointer.offsetColumn(-match[2].length),
                match[2].length,
                scanner.source);

            node = new CapoRangeStringsSpecifierNode(LiteralNode.create(from, fromRange),
                LiteralNode.create(to, toRange));
        } else {
            const discreteNode = new CapoDiscreteStringsSpecifierNode();
            node = discreteNode;

            while (!scanner.isEndOfInput && scanner.peekChar() !== ")") {
                const str = scanner.readPattern("\\d");

                let stringNumber: number;
                if (str === undefined
                    || isNaN(stringNumber = parseInt(str))
                    || stringNumber === 0
                    || stringNumber > Defaults.strings) {
                    return helper.fail(scanner.lastReadRange,
                        Messages.Error_CapoStringsSpecifierInvalidStringNumber);
                }

                if (any(discreteNode.strings, s => s.value === stringNumber)) {
                    helper.warning(scanner.lastReadRange, Messages.Warning_RedundantCapoStringSpecifier, stringNumber);
                } else {
                    discreteNode.strings.push(LiteralNode.create(stringNumber, scanner.lastReadRange));
                }

                scanner.skipWhitespaces();
            }
        }

        if (!scanner.expectChar(")")) {
            helper.warning(scanner.lastReadRange, Messages.Warning_CapoStringsSpecifierNotEnclosed);
        }

        return helper.success(node);
    }
}