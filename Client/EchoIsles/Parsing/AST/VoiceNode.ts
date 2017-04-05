import { Node } from "./Node";
import { BeatNode } from "./BeatNode";
import { PreciseDuration } from "../../Core/MusicTheory/PreciseDuration";
import { RhythmSegmentVoice } from "../../Core/Sheet/RhythmSegmentVoice";
import { DocumentContext } from "../DocumentContext";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Messages } from "../Messages";
import { Beat } from "../../Core/Sheet/Beat";
import { NoteValue } from "../../Core/MusicTheory/NoteValue";
import { Scanner } from "../Scanner";
import { RhythmSegmentNodeBase } from "./RhythmSegmentNodeBase";
import { ParseResult, ParseHelper } from "../ParseResult";

export class VoiceNode extends Node {

    readonly beats = new Array<BeatNode>();
    expectedDuration: PreciseDuration;

    get duration(): PreciseDuration {
        return PreciseDuration.sum(this.beats, b => b.noteValue.toNoteValue().duration);
    }

    compile(context: DocumentContext, voicePart: VoicePart): ParseResult<RhythmSegmentVoice> {
        const helper = new ParseHelper();
        const voice = new RhythmSegmentVoice(voicePart);
        voice.range = this.range;

        context.currentVoice = voice;

        for (let beat of this.beats) {
            const result = beat.compile(context, voice);
            if (!ParseHelper.isSuccessful(result)) {
                return helper.relayFailure(result);
            }

            voice.beats.push(result.value);
        }

        // try to fill voice with rests if insufficient notes fed
        const duration = this.duration;
        if (duration < this.expectedDuration) {
            const result = BaseNoteValue.factorize(this.expectedDuration.minus(duration));
            if (result === undefined) {
                return helper.fail(this.range, Messages.Error_InconsistentVoiceDurationCannotBeFilledWithRest);
            }

            helper.suggestion(this.range, Messages.Suggestion_InconsistentVoiceDuration);

            for (let factor of result) {
                const beat = new Beat();
                beat.noteValue = new NoteValue(factor);
                beat.isRest = true;

                context.currentVoice.isTerminatedWithRest = true;
                voice.beats.push(beat);
            }

        }

        return helper.success(voice);
    }

    valueEquals(other: RhythmSegmentVoice): boolean {
        if (other === undefined) {
            return false;
        }

        if (other.beats.length !== this.beats.length) {
            return false;
        }

        for (let i = 0; i < this.beats.length; ++i) {
            if (!this.beats[i].valueEquals(other.beats[i])) {
                return false;
            }
        }

        return true;
    }

}

export module VoiceNode {
    function isEndOfVoice(scanner: Scanner): boolean {
        return scanner.peekChar() === ";" || RhythmSegmentNodeBase.isEndOfSegment(scanner);
    }
    export function parse(scanner: Scanner): ParseResult<VoiceNode> {
        const anchor = scanner.makeAnchor();
        const helper = new ParseHelper();
        scanner.skipWhitespaces();

        const node = new VoiceNode();
        while (true) {
            const beat = BeatNode.parse(scanner);
            if (!ParseHelper.isSuccessful(beat)) {
                break;
            }

            helper.absorb(beat);

            node.beats.push(beat.value!);
            scanner.skipWhitespaces();

            if (isEndOfVoice(scanner)) {
                break;
            }
        }

        node.range = anchor.range;
        return helper.success(node);
    }
}