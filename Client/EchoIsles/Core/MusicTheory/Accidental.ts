import { StringUtilities } from "../Utilities/StringUtilities";

export enum Accidental {
    Natural,
    Sharp,
    Flat,
    DoubleSharp,
    DoubleFlat
}

export module Accidental {
    export function parse(text: string): Accidental | undefined {
        switch (text) {
            case "":
                return Accidental.Natural;
            case "b":
            case "♭":
                return Accidental.Flat;
            case "bb":
            case "♭♭":
            case StringUtilities.fixedFromCharCode(0x1d12b):
                return Accidental.DoubleFlat;
            case "#":
            case "♯":
                return Accidental.Sharp;
            case "##":
            case "♯♯":
            case StringUtilities.fixedFromCharCode(0x1d12a):
                return Accidental.DoubleSharp;
            default:
                return undefined;
        }
    }


    export function getSemitoneOffset(accidental: Accidental): number {
        switch (accidental) {
            case Accidental.Natural:
                return 0;
            case Accidental.Sharp:
                return 1;
            case Accidental.Flat:
                return -1;
            case Accidental.DoubleSharp:
                return 2;
            case Accidental.DoubleFlat:
                return -2;
            default:
                throw new RangeError("accidental out of range");
        }
    }

    export function getIsDoubleAccidental(accidental: Accidental): boolean {
        return accidental === Accidental.DoubleFlat || accidental === Accidental.DoubleSharp;
    }

}