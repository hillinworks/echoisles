import { Element } from "./Element";
import { AlternationText } from "../MusicTheory/AlternationText";
import { Explicity } from "../Explicity";
import { RomanNumerals } from "../Utilities/RomanNumerals";

export class Alternation extends Element {
    indices: number[];
    textType: AlternationText.Type;
    explicity: Explicity;

    get formattedIndices(): string {
        switch (this.textType) {
            case AlternationText.Type.Arabic:
                return this.indices.map(i => `${i}.`).join(" ");
            case AlternationText.Type.RomanUpper:
                return this.indices.map(i => `${RomanNumerals.toRoman(i)}.`).join(" ");
            case AlternationText.Type.RomanLower:
                return this.indices.map(i => `${RomanNumerals.toRoman(i).toLowerCase()}.`).join(" ");
            default:
                throw new RangeError();
        }
    }
}