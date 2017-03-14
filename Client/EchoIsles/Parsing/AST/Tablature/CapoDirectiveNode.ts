import { DirectiveNode } from "../DirectiveNode";
import { LiteralNode } from "../LiteralNode";
import { DocumentContext } from "../../DocumentContext";
import { ILogger } from "../../../Core/Logging/ILogger";
import { Capo } from "../../../Core/Sheet/Tablature/Capo";
import { LogLevel } from "../../../Core/Logging/LogLevel";
import { Messages } from "../../Messages";
import { CapoInfo } from "../../../Core/MusicTheory/String/Plucked/CapoInfo";
import { TablatureState } from "../../../Core/Sheet/Tablature/TablatureState";
import { CapoStringsSpecifierNode } from "./CapoStringsSpecifierNode";
import { Scanner } from "../../Scanner";
import { IParseResult, ParseHelper } from "../../ParseResult";
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

    apply(context: DocumentContext, logger: ILogger): boolean {
        const result = this.toDocumentElement(context, logger);

        if (!result) {
            return false;
        }

        context.alterDocumentState(state => {
            const tablatureState = state as TablatureState;
            tablatureState.capos.add(result!);
            tablatureState.capoFretOffsets = result.offsetFrets(tablatureState.capoFretOffsets);
        });

        return true;
    }

    private toDocumentElement(context: DocumentContext, logger: ILogger): Capo | undefined {
        if (context.documentState.barAppeared) {
            logger.report(LogLevel.Error, this.range, Messages.Error_CapoInstructionAfterBarAppeared);
            return undefined;
        }

        const element = new Capo();
        element.range = this.range;
        element.capoInfo = new CapoInfo(this.position.value,
            this.stringsSpecifier === undefined ? CapoInfo.affectAllStrings : this.stringsSpecifier.stringNumbers);

        return element;
    }
}

export module CapoDirectiveNode {

    export function parseBody(scanner: Scanner): IParseResult<CapoDirectiveNode> {
        const node = new CapoDirectiveNode();
        const helper = new ParseHelper();

        scanner.skipOptional(":", true);

        const position = LiteralParsers.readInteger(scanner);
        if (!ParseHelper.isSuccessful(position)) {
            return helper.fail(scanner.lastReadRange, Messages.Error_InvalidCapoPosition);
        }

        if (position.value!.value > Defaults.highestCapo) {
            helper.warning(scanner.lastReadRange, Messages.Warning_CapoTooHigh);
        }

        node.position = position.value!;

        scanner.skipWhitespaces();

        if (scanner.peek() === "(") {

            const stringsSpecifier = CapoStringsSpecifierNodeParser.parse(scanner);
            if (ParseHelper.isSuccessful(stringsSpecifier)) {
                return helper.relayFailure(stringsSpecifier);
            }

            node.stringsSpecifier = stringsSpecifier.value;
        }

        return helper.success(node);
    }
}