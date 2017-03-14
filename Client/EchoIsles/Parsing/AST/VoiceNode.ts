import { Node } from "./Node";
import { BeatNode } from "./BeatNode";
import { PreciseDuration } from "../../Core/MusicTheory/PreciseDuration";
import { RhythmSegmentVoice } from "../../Core/Sheet/RhythmSegmentVoice";
import { ILogger } from "../../Core/Logging/ILogger";
import { DocumentContext } from "../DocumentContext";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { Beat } from "../../Core/Sheet/Beat";
import { NoteValue } from "../../Core/MusicTheory/NoteValue";
import { Scanner } from "../Scanner";
import { RhythmSegmentNodeBase } from "./RhythmSegmentNodeBase";
import { IParseResult, ParseHelper } from "../ParseResult";

export class VoiceNode extends Node {

    readonly beats = new Array<BeatNode>();
    expectedDuration: PreciseDuration;

    get duration(): PreciseDuration {
        return PreciseDuration.sum(this.beats, b => b.noteValue.toNoteValue().duration);
    }

    toDocumentElement(context: DocumentContext, logger: ILogger, voicePart: VoicePart): RhythmSegmentVoice | undefined {

        const voice = new RhythmSegmentVoice(voicePart);
        voice.range = this.range;

        context.currentVoice = voice;

        for (let beat of this.beats) {
            const result = beat.toDocumentElement(context, logger, voice);
            if (!result) {
                return undefined;
            }

            voice.beats.push(result!);
        }

        // try to fill voice with rests if insufficient notes fed
        const duration = this.duration;
        if (duration < this.expectedDuration) {
            const result = BaseNoteValue.factorize(this.expectedDuration.minus(duration));
            if (!result) {
                logger.report(LogLevel.Error,
                    this.range,
                    Messages.Error_InconsistentVoiceDurationCannotBeFilledWithRest);

                return undefined;
            }

            logger.report(LogLevel.Suggestion, this.range, Messages.Suggestion_InconsistentVoiceDuration);

            for (let factor of result) {
                const beat = new Beat();
                beat.noteValue = new NoteValue(factor);
                beat.isRest = true;

                context.currentVoice.isTerminatedWithRest = true;
                voice.beats.push(beat);
            }

        }

        return voice;
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
    export function parse(scanner: Scanner): IParseResult<VoiceNode> {
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