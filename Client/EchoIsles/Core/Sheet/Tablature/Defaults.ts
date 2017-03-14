import { CapoInfo } from "../../MusicTheory/String/Plucked/CapoInfo";
import { GuitarTunings } from "../../MusicTheory/String/Plucked/GuitarTunings"

export module Defaults {
    export const strings = 6;
    export const tuning = GuitarTunings.standard;
    export const capo = CapoInfo.noCapo;
    export const highestFret = 24;
    export const highestCapo = 12;
}