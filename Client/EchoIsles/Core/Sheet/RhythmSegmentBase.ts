import { Element } from "./Element"
import { RhythmSegmentVoice } from "./RhythmSegmentVoice";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";

export abstract class RhythmSegmentBase extends Element {
    trebleVoice?: RhythmSegmentVoice;
    bassVoice?: RhythmSegmentVoice;

    get firstVoice(): RhythmSegmentVoice | undefined {
        return this.trebleVoice === undefined ? this.bassVoice : this.trebleVoice;
    }

    get duration(): PreciseDuration {
        if (this.trebleVoice === undefined) {

            if (this.bassVoice === undefined) {
                throw new Error("trebleVoice and bassVoice cannot be both empty");
            }

            return this.bassVoice.duration;
        }

        if (this.bassVoice === undefined)
            return this.trebleVoice.duration;

        return new PreciseDuration(Math.max(this.trebleVoice.duration.fixedPointValue,
            this.bassVoice.duration.fixedPointValue));
    }

}