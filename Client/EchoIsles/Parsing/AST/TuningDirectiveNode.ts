﻿import { ILogger } from "../../Core/Logging/ILogger";
import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";
import { DocumentContext } from "../DocumentContext";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { PitchNode } from "./PitchNode";
import { TuningSignature } from "../../Core/Sheet/TuningSignature";
import { Tuning } from "../../Core/MusicTheory/String/Tuning";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";
import { GuitarTunings } from "../../Core/MusicTheory/String/Plucked/GuitarTunings";

export class TuningDirectiveNode extends DirectiveNode {
    name: LiteralNode<string>;
    readonly stringTunings = new Array<PitchNode>();

    apply(context: DocumentContext, logger: ILogger): boolean {
        if (context.documentState.barAppeared) {
            logger.report(LogLevel.Error, this.range, Messages.Error_TuningInstructionAfterBarAppeared);
            return false;
        }

        const tablatureState = context.documentState as TablatureState;
        if (tablatureState.tuningSignature !== undefined) {
            logger.report(LogLevel.Warning, this.range, Messages.Warning_RedefiningTuningInstruction);
            return false;
        }

        const result = this.toDocumentElement(context, logger);
        if (!result) {
            return false;
        }

        context.alterDocumentState(state => (state as TablatureState).tuningSignature = result);

        return true;
    }

    private toDocumentElement(context: DocumentContext, logger: ILogger): TuningSignature | undefined {
        const element = new TuningSignature();
        element.range = this.range;
        element.tuning = new Tuning(LiteralNode.valueOrUndefined(this.name), ...this.stringTunings.map(t => t.toPitch()));

        return element;
    }
}

export module TuningDirectiveNode {

    function parseExplicitTuning(scanner: Scanner, helper: ParseHelper, stringTunings: PitchNode[], name?: string): boolean {
        while (!scanner.isEndOfLine) {
            const pitch = helper.absorb(PitchNode.parse(scanner));
            if (!ParseHelper.isSuccessful(pitch)) {
                return false;
            }

            stringTunings.push(pitch.value!);
            scanner.skipOptional(",", true);
        }

        return true;
    }

    export function parseBody(scanner: Scanner): IParseResult<TuningDirectiveNode> {
        scanner.skipOptional(":", true);

        const node = new TuningDirectiveNode();
        const helper = new ParseHelper();
        const tuningString = scanner.readToLineEnd().trim();

        if (tuningString.length === 0) {
            helper.suggestion(scanner.lastReadRange, Messages.Suggestion_TuningNotSpecified);
            return helper.success(node);
        }

        const colonIndex = tuningString.lastIndexOf(":");

        if (colonIndex >= 0) {
            const namePart = tuningString.substr(0, colonIndex);
            const namePartIsEmpty = namePart.length === 0;
            if (namePartIsEmpty) {
                helper.hint(scanner.lastReadRange.from.asRange(scanner.source),
                    Messages.Hint_RedundantColonInTuningSpecifier);
            } else {
                node.name = LiteralNode.create(namePart,
                    new TextRange(scanner.lastReadRange.from, namePart.length, scanner.source));
            }

            const tuningPart = tuningString.substr(colonIndex + 1).trim();
            if (tuningPart.length === 0) {
                if (namePartIsEmpty) {
                    helper.suggestion(scanner.lastReadRange, Messages.Suggestion_TuningNotSpecified);
                    return helper.success(node);
                }

                helper.hint(scanner.lastReadRange.from.offsetColumn(colonIndex).asRange(scanner.source),
                    Messages.Hint_RedundantColonInTuningSpecifier);
            } else {
                scanner.textPointer = scanner.lastReadRange.from.offsetColumn(colonIndex + 1);
                if (parseExplicitTuning(scanner, helper, node.stringTunings, namePart)) {
                    // todo: validate
                    //if (!namePartIsEmpty)
                    //{
                    //    var namedTuning = Tunings.GetKnownTuning(namePart);
                    //    if (namedTuning != null && namedTuning.InOctaveEquals(explicitTuning))
                    //    {
                    //        this.Report(ReportLevel.Hint, scanner.LastReadRange,
                    //                    ParseMessages.Hint_RedundantKnownTuningSpecifier, namedTuning.Name);
                    //    }
                    //}

                    return helper.success(node);
                }

                return helper.fail(scanner.lastReadRange, Messages.Error_InvalidTuning);
            }
        } else {
            const tuning = GuitarTunings.getKnownTunings(tuningString);
            if (tuning) {
                node.name = LiteralNode.create(tuningString, scanner.lastReadRange);
                return helper.success(node);
            }

            scanner.textPointer = scanner.lastReadRange.from;

            if (!parseExplicitTuning(scanner, helper, node.stringTunings)) {
                return helper.success(node);
            }
        }

        return helper.fail(scanner.lastReadRange, Messages.Error_InvalidTuning);
    }

}