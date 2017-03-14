import { IChordFingering } from "./IChordFingering";

export interface IChordDefinition {
    readonly displayName: string;
    readonly fingering: IChordFingering;
}