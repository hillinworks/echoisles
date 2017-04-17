import { VoicePart } from "./VoicePart";
import { IBarElement } from "./IBarElement"

export interface IBarVoiceElement extends IBarElement {
    readonly voicePart : VoicePart;
}