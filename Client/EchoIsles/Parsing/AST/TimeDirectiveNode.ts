import { DirectiveNode } from "./DirectiveNode";
import { LiteralNode } from "./LiteralNode";
import { DocumentContext } from "../DocumentContext";
import { Messages } from "../Messages";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { TimeSignature } from "../../Core/Sheet/TimeSignature";
import { Time } from "../../Core/MusicTheory/Time";
import { Scanner } from "../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";


export class TimeDirectiveNode extends DirectiveNode {

    beats: LiteralNode<number>;
    noteValue: LiteralNode<BaseNoteValue>;

    apply(context: DocumentContext): ParseResultMaybeEmpty<void> {

        const result = this.compile(context);
        if (!ParseHelper.isSuccessful(result)) {
            return ParseHelper.relayState(result);
        }

        context.alterDocumentState(state => state.timeSignature = result.value);

        return ParseHelper.voidSuccess;
    }

    private compile(context: DocumentContext): ParseResultMaybeEmpty<TimeSignature> {
        const helper = new ParseHelper();
        if ((/*context.DocumentState.RhythmTemplate !== undefined || */
            context.documentState.barAppeared) // todo: handle RhythmTemplate
            && context.documentState.timeSignature === undefined) {
            return helper.fail(this.range, Messages.Error_TimeInstructionAfterBarAppearedOrRhythmInstruction);
        }

        if (context.documentState.timeSignature !== undefined
            && this.valueEquals(context.documentState.timeSignature)) {
            helper.suggestion(this.range, Messages.Suggestion_UselessTimeInstruction);
            return ParseHelper.empty();
        }

        const element = new TimeSignature();
        element.range = this.range;
        element.time = new Time(this.beats.value, this.noteValue.value);

        return ParseHelper.success(element);
    }

    valueEquals(other: TimeSignature): boolean {
        if (other === undefined)
            return false;

        return this.beats.value === other.time.beats && this.noteValue.value === other.time.noteValue;
    }
}

export module TimeDirectiveNode {

    export function parseBody(scanner: Scanner): ParseResult<TimeDirectiveNode> {

        scanner.skipOptional(":", true);

        const node = new TimeDirectiveNode();

        const match = scanner.match("(\\d+)\\s*\\/\\s*(\\d+)");

        if (!match) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_InvalidTimeSignature);
        }

        const beats = parseInt(match[1]);
        const match1Range = new TextRange(scanner.lastReadRange.from, match[1].length, scanner.source);

        if (isNaN(beats)) {
            return ParseHelper.fail(match1Range, Messages.Error_InvalidNumber);
        }

        if (beats > 32) {
            return ParseHelper.fail(match1Range, Messages.Error_UnsupportedBeatsInTimeSignature);
        }

        node.beats = LiteralNode.create(beats, match1Range);

        const noteValueNumber = parseInt(match[2]);
        const match2Range = new TextRange(scanner.lastReadRange.to.offsetColumn(match[2].length), match[2].length, scanner.source);

        if (isNaN(noteValueNumber)) {
            return ParseHelper.fail(match2Range, Messages.Error_InvalidNumber);
        }

        if (noteValueNumber > 32) {
            return ParseHelper.fail(match2Range, Messages.Error_UnsupportedNoteValueInTimeSignature);
        }

        const noteValue = BaseNoteValue.parse(noteValueNumber);

        if (noteValue === undefined) {
            return ParseHelper.fail(match2Range, Messages.Error_IrrationalNoteValueInTimeSignatureNotSupported);
        }

        node.noteValue = LiteralNode.create(noteValue, match2Range);

        return ParseHelper.success(node);
    }

}