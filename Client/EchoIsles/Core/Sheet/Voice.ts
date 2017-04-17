import { VirtualElement } from "./VirtualElement";
import { IBeatElementContainer } from "./IBeatElementContainer";
import { IBeatElement } from "./IBeatElement";
import { Bar } from "./Bar";
import { VoicePart } from "./VoicePart";
import { BeatNote } from "./BeatNote";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";
import { Defaults } from "./Tablature/Defaults";

export class Voice extends VirtualElement implements IBeatElementContainer {
    readonly elements = new Array<IBeatElement>();

    readonly ownerBar: Bar;
    readonly voicePart: VoicePart;

    readonly lastNoteOnStrings = new Array<BeatNote | undefined>(Defaults.strings); // todo: refactor

    private _isTerminatedWithRest: boolean;

    constructor(ownerBar: Bar, voicePart: VoicePart) {
        super();
        this.ownerBar = ownerBar;
        this.voicePart = voicePart;
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

    get duration(): PreciseDuration {
        return PreciseDuration.sum(this.elements, e => e.duration);
    }
}