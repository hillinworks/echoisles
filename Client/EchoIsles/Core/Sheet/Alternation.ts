import { Element } from "./Element";
import { AlternationText } from "../MusicTheory/AlternationText";
import { Explicity } from "../Explicity";
import { RomanNumerals } from "../Utilities/RomanNumerals";
import { L } from "../Utilities/LinqLite";

export class Alternation extends Element {
    indices: number[];
    textType: AlternationText.Type;
    explicity: Explicity;

    get formattedIndices(): string {
        switch (this.textType) {
            case AlternationText.Type.Arabic:
                return L(this.indices).select(i => `${i}.`).toArray().join(" ");
            case AlternationText.Type.RomanUpper:
                return L(this.indices).select(i => `${RomanNumerals.toRoman(i)}.`).toArray().join(" ");
            case AlternationText.Type.RomanLower:
                return L(this.indices).select(i => `${RomanNumerals.toRoman(i).toLowerCase()}.`).toArray().join(" ");
            default:
                throw new RangeError();
        }
    }
}