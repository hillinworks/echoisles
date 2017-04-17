import { BeatModifier } from "./BeatModifier";

export enum HoldAndPause {
    None = 0,
    Staccato = 11,
    Tenuto = 13,
    Fermata = 14
}

export module HoldAndPause {

    export function toBeatModifier(holdAndPause: HoldAndPause): BeatModifier {
        return holdAndPause as number as BeatModifier;
    }

}