import { VirtualElement } from "./VirtualElement";
import { Bar } from "./Bar";
import { Beat } from "./Beat";
import { LyricsSegment } from "./LyricsSegment";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";
import { IBarElement } from "./IBarElement";
import { Chord } from "./Tablature/Chord";

export class BarColumn extends VirtualElement implements IBarElement {
    readonly ownerBar: Bar;
    readonly index: number;
    readonly voiceBeats = new Array<Beat>();
    chord: Chord;
    lyrics: LyricsSegment;
    isFirstOfSegment: boolean;

    constructor(owner: Bar, index: number) {
        super();
        this.ownerBar = owner;
        this.index = index;
    }

    get duration(): PreciseDuration {
        return PreciseDuration.min(this.voiceBeats, v => v.duration);
    }
}