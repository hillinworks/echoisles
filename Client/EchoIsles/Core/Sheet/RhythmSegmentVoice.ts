import { Element } from "./Element"
import { Beat } from "./Beat";
import { VoicePart } from "./VoicePart";
import { BeatNote } from "./BeatNote";
import { Defaults } from "./Tablature/Defaults";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";

export class RhythmSegmentVoice extends Element {
    readonly beats = new Array<Beat>();
    readonly part: VoicePart;
    readonly lastNoteOnStrings = new Array<BeatNote | undefined>(Defaults.strings); // todo: refactor

    private _isTerminatedWithRest: boolean;

    constructor(part: VoicePart) {
        super();
        this.part = part;
    }

    get duration(): PreciseDuration {
        return PreciseDuration.sum(this.beats, b => b.duration);
    }

    get isTerminatedWithRest(): boolean {
        return this._isTerminatedWithRest;
    }

    set isTerminatedWithRest(value: boolean) {
        this._isTerminatedWithRest = value;
        if (value) {
            for (let i = 0; i < this.lastNoteOnStrings.length; ++i)
                this.lastNoteOnStrings[i] = undefined;
        }
    }

    clearRange(): void {
        this.range = undefined;
        this.beats.forEach(b => b.clearRange());
    }

    clone(): RhythmSegmentVoice {
        const clone = new RhythmSegmentVoice(this.part);
        clone.range = this.range;
        this.beats.forEach((b, i) => clone.beats[i] = b.clone());
        return clone;
    }
}