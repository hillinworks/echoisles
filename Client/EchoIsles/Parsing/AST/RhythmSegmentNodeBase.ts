import { Node } from "./Node";
import { VoiceNode } from "./VoiceNode";
import { PreciseDuration } from "../../Core/MusicTheory/PreciseDuration";
import { RhythmSegmentBase } from "../../Core/Sheet/RhythmSegmentBase";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { DocumentContext } from "../DocumentContext";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper } from "../ParseResult";
import { Messages } from "../Messages";


export abstract class RhythmSegmentNodeBase extends Node {

    trebleVoice: VoiceNode;
    bassVoice: VoiceNode;

    get firstVoice(): VoiceNode {
        return this.trebleVoice === undefined ? this.bassVoice : this.trebleVoice;
    }

    get duration(): PreciseDuration {
        if (this.trebleVoice === undefined) {
            return this.bassVoice === undefined ? PreciseDuration.zero : this.bassVoice.duration;
        }

        if (this.bassVoice === undefined)
            return this.trebleVoice.duration;

        return new PreciseDuration(Math.max(this.bassVoice.duration.fixedPointValue, this.trebleVoice.duration.fixedPointValue));
    }

    protected fillRhythmSegmentVoices(context: DocumentContext, rhythmSegment: RhythmSegmentBase): ParseResult<void> {
        const helper = new ParseHelper();
        const duration = this.duration;

        if (this.trebleVoice !== undefined) {
            this.trebleVoice.expectedDuration = duration;

            const result = helper.absorb(this.trebleVoice.compile(context, VoicePart.Treble));

            if (!ParseHelper.isSuccessful(result)) {
                return helper.fail();
            }

            rhythmSegment.trebleVoice = result.value;
        }

        if (this.bassVoice !== undefined) {
            this.bassVoice.expectedDuration = duration;

            const result = helper.absorb(this.bassVoice.compile(context, VoicePart.Bass));
            if (!ParseHelper.isSuccessful(result)) {
                return helper.fail();
            }

            rhythmSegment.bassVoice = result.value;
        }

        return ParseHelper.voidSuccess;
    }
}

export module RhythmSegmentNodeBase {

    function readBassVoice(scanner: Scanner, node: RhythmSegmentNodeBase, result: ParseHelper): boolean {
        const voice = VoiceNode.parse(scanner);
        if (ParseHelper.isSuccessful(voice)) {
            node.bassVoice = voice.value!;
            scanner.skipWhitespaces();

            if (scanner.peekChar() === ";") {
                result.error(scanner.textPointer.toRange(scanner.textPointer, scanner.source),
                    Messages.Error_UnrecognizableRhythmSegmentElement);
                return false;
            }
        } else {
            result.error(scanner.textPointer.toRange(scanner.textPointer, scanner.source),
                Messages.Error_UnrecognizableRhythmSegmentElement);
            return false;
        }

        return true;
    }

    export function isEndOfSegment(scanner: Scanner): boolean {
        return scanner.peekChar() === "]" || scanner.isEndOfLine;
    }


    export function parseRhythmDefinition(scanner: Scanner, node: RhythmSegmentNodeBase, optionalBrackets: boolean): ParseResult<void> {
        const helper = new ParseHelper();

        const anchor = scanner.makeAnchor();
        const hasBracket = scanner.expectChar("[");

        if (optionalBrackets && !hasBracket) {
            return helper.fail(scanner.lastReadRange, Messages.Error_RhythmSegmentExpectOpeningBracket);
        }

        scanner.skipWhitespaces();

        if (!RhythmSegmentNodeBase.isEndOfSegment(scanner)) {
            if (scanner.expectChar(";")) {
                if (!readBassVoice(scanner, node, helper)) {
                    return helper.fail();
                }
            } else {
                const voice = helper.absorb(VoiceNode.parse(scanner));
                if (ParseHelper.isSuccessful(voice)) {
                    node.trebleVoice = voice.value!;
                    scanner.skipWhitespaces();

                    if (scanner.expectChar(";")) {
                        if (!readBassVoice(scanner, node, helper)) {
                            return helper.fail();
                        }
                    }
                } else {
                    return helper.fail(scanner.textPointer.toRange(scanner.textPointer, scanner.source),
                        Messages.Error_UnrecognizableRhythmSegmentElement); // todo: should we fail so fast?
                }
            }
        }

        if (hasBracket) {
            if (scanner.expectChar("]")) {
                return helper.success(undefined);
            }

            if (optionalBrackets) {
                helper.warning(scanner.lastReadRange,
                    Messages.Warning_RhythmSegmentMissingCloseBracket);
            } else {
                return helper.fail(scanner.lastReadRange,
                    Messages.Error_RhythmSegmentMissingCloseBracket);
            }
        }

        if (!node.bassVoice && !node.trebleVoice) {
            helper.warning(scanner.lastReadRange, Messages.Warning_EmptyRhythmSegment);
        }

        node.range = anchor.range;

        return helper.success(undefined);
    }
}