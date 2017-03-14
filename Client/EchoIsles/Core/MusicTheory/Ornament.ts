import { BeatModifier } from "./BeatModifier";

export enum Ornament {
    None = 0,
    Trill = 31,
    Mordent = 32,
    LowerMordent = 33,
    Turn = 34,
    InvertedTurn = 35
}

export module Ornament {
    export function toBeatModifier(ornament: Ornament): BeatModifier {
        return ornament as number as BeatModifier;
    }
}