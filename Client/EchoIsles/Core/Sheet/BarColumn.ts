import { VirtualElement } from "./VirtualElement";
import { Bar } from "./Bar";
import { Beat } from "./Beat";
import { LyricsSegment } from "./LyricsSegment";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";
import { IBarElement } from "./IBarElement";
import { Chord } from "./Tablature/Chord";

export class BarColumn extends VirtualElement implements IBarElement {
    readonly voiceBeats = new Array<Beat>();
    chord: Chord;
    lyrics: LyricsSegment;
    isFirstOfSegment: boolean;
    
    constructor(readonly ownerBar: Bar, readonly index: number, readonly position: PreciseDuration) {
        super();
    }

    get minimumBeatDuration(): PreciseDuration {
        return PreciseDuration.min(this.voiceBeats, b => b.duration);
    }
}