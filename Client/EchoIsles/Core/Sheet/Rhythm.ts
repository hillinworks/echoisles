﻿import { Element } from "./Element"
import { RhythmSegment } from "./RhythmSegment";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";
import { select } from "../Utilities/LinqLite";

export class Rhythm extends Element {
    readonly segments = new Array<RhythmSegment>();
    notMatchingTime: boolean;

    get duration(): PreciseDuration {
        return PreciseDuration.sum(this.segments, s => s.duration);
    }

    clone(): Rhythm {
        const clone = new Rhythm();
        clone.range = this.range;
        clone.notMatchingTime = this.notMatchingTime;
        clone.segments.push(...select(this.segments, s => s.clone()));
        return clone;
    }
}