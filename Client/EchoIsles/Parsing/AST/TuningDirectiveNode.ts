import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";
import { DocumentContext } from "../DocumentContext";
import { Messages } from "../Messages";
import { PitchNode } from "./PitchNode";
import { TuningSignature } from "../../Core/Sheet/TuningSignature";
import { Tuning } from "../../Core/MusicTheory/String/Tuning";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { Scanner } from "../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper, IParseSuccessResult } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";
import { GuitarTunings } from "../../Core/MusicTheory/String/Plucked/GuitarTunings";
import { select } from "../../Core/Utilities/LinqLite";

export class TuningDirectiveNode extends DirectiveNode {
    name: LiteralNode<string>;
    readonly stringTunings = new Array<PitchNode>();

    apply(context: DocumentContext): ParseResultMaybeEmpty<void> {
        const helper = new ParseHelper();
        if (context.documentState.barAppeared) {
            return helper.fail(this.range, Messages.Error_TuningInstructionAfterBarAppeared);
        }

        const tablatureState = context.documentState as TablatureState;
        if (tablatureState.tuningSignature !== undefined) {
            helper.warning(this.range, Messages.Warning_RedefiningTuningInstruction);
            return helper.empty();
        }

        const result = helper.absorb(this.compile(context));
        if (!ParseHelper.isSuccessful(result)) {
            return helper.fail();
        }

        context.alterDocumentState(state => (state as TablatureState).tuningSignature = result.value);

        return helper.voidSuccess();
    }

    private compile(context: DocumentContext): IParseSuccessResult<TuningSignature> {
        const helper = new ParseHelper();
        const element = new TuningSignature();
        element.range = this.range;
        element.tuning = new Tuning(LiteralNode.valueOrUndefined(this.name), ...select(this.stringTunings, t => t.toPitch()));

        return helper.success(element);
    }
}

export module TuningDirectiveNode {

    function parseExplicitTuning(scanner: Scanner, helper: ParseHelper, stringTunings: PitchNode[], name?: string): boolean {

        while (!scanner.isEndOfLine) {
            const pitch = helper.absorb(PitchNode.parse(scanner));
            if (!ParseHelper.isSuccessful(pitch)) {
                return false;
            }

            stringTunings.push(pitch.value);
            scanner.skipOptional(",", true);
        }

        return true;
    }

    export function parseBody(scanner: Scanner): ParseResult<TuningDirectiveNode> {
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