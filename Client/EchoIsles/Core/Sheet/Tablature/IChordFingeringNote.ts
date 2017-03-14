import { LeftHandFingerIndex } from "../../Player/LeftHandFingerIndex";

export interface IChordFingeringNote {
    readonly fret: number;
    readonly fingerIndex: LeftHandFingerIndex;
    readonly isImportant: boolean;
}