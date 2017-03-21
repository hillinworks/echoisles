import { BarLine } from "../MusicTheory/BarLine";
import { Element } from "./Element";
import { Rhythm } from "./Rhythm";
import { Lyrics } from "./Lyrics";
import { DocumentState } from "./DocumentState";
import { Voice } from "./Voice";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";
import { BarColumn } from "./BarColumn";
import { AlternativeEndingPosition } from "./AlternativeEndingPosition";
import { VoicePart } from "./VoicePart";
import { IBeatElementContainer } from "./IBeatElementContainer";

export class Bar extends Element {
    index: number;
    openLine?: BarLine.OpenType;
    closeLine?: BarLine.CloseType;
    rhythm: Rhythm;
    lyrics?: Lyrics;
    documentState: DocumentState;

    trebleVoice: Voice;
    bassVoice: Voice;
    duration: PreciseDuration;
    readonly columns = new Array<BarColumn>();

    previousBar: Bar;
    nextBar: Bar;

    /**
     * The logically previous bar of this bar. For most bars, it's the previous neighbor on the tablature, but
     * for bars starting an alternation, it could be a remote one.
     */
    logicalPreviousBar: Bar;

    get alternativeEndingPosition(): AlternativeEndingPosition {
        const alternation = this.documentState.currentAlternation;

        if (alternation == null) {
            return AlternativeEndingPosition.None;
        }

        const isStart = this.previousBar == null
            || this.previousBar.documentState.currentAlternation !== alternation;

        const isEnd = this.nextBar == null
            || this.nextBar.documentState.currentAlternation !== alternation;

        if (isStart) {
            return isEnd ? AlternativeEndingPosition.StartAndEnd : AlternativeEndingPosition.Start;
        }

        if (isEnd) {
            return AlternativeEndingPosition.End;
        }

        return AlternativeEndingPosition.Inside;
    }

    getVoice(part: VoicePart): Voice {
        switch (part) {
            case VoicePart.Treble:
                return this.trebleVoice;
            case VoicePart.Bass:
                return this.bassVoice;
            default:
                throw new RangeError();
        }
    }

    get minimumBeatDuration(): PreciseDuration {
        if (this.trebleVoice === undefined || this.trebleVoice.elements.length === 0) {
            return IBeatElementContainer.getMinimumBeatDuration(this.bassVoice);
        } else if (this.bassVoice === undefined || this.bassVoice.elements.length === 0) {
            return IBeatElementContainer.getMinimumBeatDuration(this.trebleVoice);
        }

        return new PreciseDuration(Math.min(IBeatElementContainer.getMinimumBeatDuration(this.bassVoice).fixedPointValue,
            IBeatElementContainer.getMinimumBeatDuration(this.trebleVoice).fixedPointValue));
    }
}