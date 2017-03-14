import { RhythmSegmentBase } from "./RhythmSegmentBase";
import { Chord } from "./Tablature/Chord";

export class RhythmSegment extends RhythmSegmentBase {
    chord: Chord;   // todo: refator
    isOmittedByTemplate: boolean;

    clone(): RhythmSegment {
        const clone = new RhythmSegment();
        clone.range = this.range;
        clone.chord = this.chord.clone();
        clone.isOmittedByTemplate = this.isOmittedByTemplate;
        clone.bassVoice = this.bassVoice === undefined ? undefined : this.bassVoice.clone();
        clone.trebleVoice = this.trebleVoice === undefined ? undefined : this.trebleVoice.clone();

        return clone;
    }
}