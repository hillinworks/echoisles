import { Beam } from "./Beam";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";
import { IBarVoiceElement } from "./IBarVoiceElement"

export interface IBeatElement extends IBarVoiceElement {
    readonly ownerBeam?: Beam;
    readonly duration: PreciseDuration;
    clearRange(): void;
}