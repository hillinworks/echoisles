import {IBarDescendant} from "./IBarDescendant";
import {Voice} from "./Voice";

export interface IVoiceDescendant extends IBarDescendant {
    readonly ownerVoice: Voice;
}