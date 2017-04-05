import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";
import { DocumentContext } from "../DocumentContext";
import { Messages } from "../Messages";
import { TempoSignature } from "../../Core/Sheet/TempoSignature";
import { Tempo } from "../../Core/MusicTheory/Tempo";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Scanner } from "../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";
import { Defaults } from "../../Core/Sheet/Defaults";

export class TempoDirectiveNode extends DirectiveNode {

    noteValue: LiteralNode<BaseNoteValue>;
    beats: LiteralNode<number>;

    apply(context: DocumentContext): ParseResultMaybeEmpty<void> {
        const result = this.compile(context);
        if (!ParseHelper.isSuccessful(result)) {
            return ParseHelper.relayState(result);
        }

        context.alterDocumentState(state => state.tempoSignature = result.value);

        return ParseHelper.voidSuccess;
    }

    private compile(context: DocumentContext): ParseResultMaybeEmpty<TempoSignature> {
        const helper = new ParseHelper();

        if (this.valueEquals(context.documentState.tempoSignature)) {
            helper.suggestion(this.range, Messages.Suggestion_UselessTempoInstruction);
            return ParseHelper.empty();
        }

        const element = new TempoSignature();
        element.range = this.range;
        element.tempo = new Tempo(this.beats.value, LiteralNode.valueOrDefault(this.noteValue, BaseNoteValue.Quater));
        return ParseHelper.success(element);
    }

    valueEquals(other: TempoSignature): boolean {
        if (other === undefined)
            return false;

        if (this.noteValue === undefined) {
            if (other.tempo.noteValue !== BaseNoteValue.Quater) {
                return false;
            }
        } else if (this.noteValue.value !== other.tempo.noteValue) {
            return false;
        }

        return this.beats.value === other.tempo.beats;
    }
}

export module TempoDirectiveNode {
    export function parseBody(scanner: Scanner): ParseResult<TempoDirectiveNode> {
        scanner.skipOptional(":", true);

        const node = new TempoDirectiveNode();

        const match = scanner.match("((\\d+)\\s*=\\s*)?(\\d+)");

        if (!match) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_InvalidTempoSignature);
        }

        if (match[1].length > 0) {
            const noteValueNumber = parseInt(match[2]);
            const match2Range = new TextRange(scanner.lastReadRange.from, match[2].length, scanner.source);

            if (isNaN(noteValueNumber)) {
                return ParseHelper.fail(match2Range, Messages.Error_InvalidNumber);
            }

            const noteValue = BaseNoteValue.parse(noteValueNumber);

            if (noteValue === undefined) {
                return ParseHelper.fail(match2Range,
                    Messages.Error_IrrationalNoteValueInTempoSignatureNotSupported);
            }

            node.noteValue = LiteralNode.create(noteValue!, match2Range);
        }

        const beats = parseInt(match[3]);
        const match3Range = new TextRange(scanner.lastReadRange.to.offsetColumn(match[3].length), match[3].length, scanner.source);

        if (isNaN(beats)) {
            return ParseHelper.fail(match3Range, Messages.Error_InvalidTempoSignatureSpeed);
        }

        if (beats === 0) {
            return ParseHelper.fail(match3Range, Messages.Error_TempoSignatureSpeedTooLow);
        }

        if (beats > Defaults.maxSpeed) {
            return ParseHelper.fail(match3Range, Messages.Error_TempoSignatureSpeedTooFast);
        }

        node.beats = LiteralNode.create(beats, match3Range);

        return ParseHelper.success(node);
    }
}