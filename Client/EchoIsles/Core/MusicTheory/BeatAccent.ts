import { BeatModifier } from "./BeatModifier";

export enum BeatAccent {
    Normal = 0,
    Accented = 1,
    Marcato = 2
}

export module BeatAccent {
    export function toBeatModifier(accent: BeatAccent): BeatModifier {
        return accent as number as BeatModifier;
    }
}