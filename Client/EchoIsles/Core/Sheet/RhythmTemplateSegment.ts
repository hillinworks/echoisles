import { RhythmSegmentBase } from "./RhythmSegmentBase";
import { RhythmSegment } from "./RhythmSegment";
import { RhythmSegmentVoice } from "./RhythmSegmentVoice";

function instantializeVoice(voice: RhythmSegmentVoice): RhythmSegmentVoice {
    const instance = voice.clone();
    instance.clearRange();
    return instance;
}

export class RhythmTemplateSegment extends RhythmSegmentBase {

    instantialize(): RhythmSegment {
        const segment = new RhythmSegment();    // do not set range

        if (this.trebleVoice !== undefined)
            segment.trebleVoice = instantializeVoice(this.trebleVoice);

        if (this.bassVoice !== undefined)
            segment.bassVoice = instantializeVoice(this.bassVoice);

        return segment;
    }
}