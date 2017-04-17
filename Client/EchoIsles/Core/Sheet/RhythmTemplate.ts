import { Element } from "./Element"
import { RhythmTemplateSegment } from "./RhythmTemplateSegment";
import { Rhythm } from "./Rhythm";

export class RhythmTemplate extends Element {
    readonly segments = new Array<RhythmTemplateSegment>();

    instantialize(): Rhythm {
        const rhythm = new Rhythm(); // do not set range
        this.segments.forEach(s => rhythm.segments.push(s.instantialize()));
        return rhythm;
    }
}