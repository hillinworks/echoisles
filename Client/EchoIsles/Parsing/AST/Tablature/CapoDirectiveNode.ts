import { DirectiveNode } from "../DirectiveNode";
import { LiteralNode } from "../LiteralNode";
import { DocumentContext } from "../../DocumentContext";
import { Capo } from "../../../Core/Sheet/Tablature/Capo";
import { Messages } from "../../Messages";
import { CapoInfo } from "../../../Core/MusicTheory/String/Plucked/CapoInfo";
import { TablatureState } from "../../../Core/Sheet/Tablature/TablatureState";
import { CapoStringsSpecifierNode } from "./CapoStringsSpecifierNode";
import { Scanner } from "../../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../../ParseResult";
import { LiteralParsers } from "../../LiteralParsers";
import { TextRange } from "../../../Core/Parsing/TextRange";
import { Defaults } from "../../../Core/Sheet/Tablature/Defaults";
import { CapoStringsSpecifierNodeParser } from "./CapoStringsSpecifierNodeParser";

export class CapoDirectiveNode extends DirectiveNode {

    position: LiteralNode<number>;
    stringsSpecifier?: CapoStringsSpecifierNode;

    constructor(range?: TextRange) {
        super(range);
    }

    apply(context: DocumentContext): ParseResultMaybeEmpty<void> {
        const helper = new ParseHelper();
        const result = helper.absorb(this.compile(context));

        if (!ParseHelper.isSuccessful(result)) {
            return helper.fail();
        }

        context.alterDocumentState(state => {
            const tablatureState = state as TablatureState;
            tablatureState.capos.add(result.value);
            tablatureState.capoFretOffsets = result.value.offsetFrets(tablatureState.capoFretOffsets);
        });

        return helper.voidSuccess();
    }

    private compile(context: DocumentContext): ParseResult<Capo> {
        const helper = new ParseHelper();
        if (context.documentState.barAppeared) {
            return helper.fail(this.range, Messages.Error_CapoInstructionAfterBarAppeared);
        }

        const element = new Capo();
        element.range = this.range;
        element.capoInfo = new CapoInfo(this.position.value,
            this.stringsSpecifier === undefined ? CapoInfo.affectAllStrings : this.stringsSpecifier.stringNumbers);

        return helper.success(element);
    }
}

export module CapoDirectiveNode {

    export function parseBody(scanner: Scanner): ParseResult<CapoDirectiveNode> {
        const node = new CapoDirectiveNode();
        const helper = new ParseHelper();

        scanner.skipOptional(":", true);

        const position = helper.absorb(LiteralParsers.readInteger(scanner));
        if (!ParseHelper.isSuccessful(position)) {
            return helper.fail(scanner.lastReadRange, Messages.Error_InvalidCapoPosition);
        }

        if (position.value.value > Defaults.highestCapo) {
            helper.warning(scanner.lastReadRange, Messages.Warning_CapoTooHigh);
        }

        node.position = position.value!;

        scanner.skipWhitespaces();

        if (scanner.peek() === "(") {

            const stringsSpecifier = helper.absorb(CapoStringsSpecifierNodeParser.parse(scanner));
            if (!ParseHelper.isSuccessful(stringsSpecifier)) {
                return helper.fail();
            }

            node.stringsSpecifier = stringsSpecifier.value;
        }

        return helper.success(node);
    }
}