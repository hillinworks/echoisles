import { glyphes, glyphKey } from "./metadata/glyphnames";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { BeatModifier } from "../../Core/MusicTheory/BeatModifier";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";

function fixedFromCharCode(codePt: number): string {
    if (codePt > 0xFFFF) {
        codePt -= 0x10000;
        return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
    }
    else {
        return String.fromCharCode(codePt);
    }
}

export class Smufl {

    static GetCharacter(name: glyphKey | number): string {
        let codePt = typeof name === "string" ? glyphes[name].codepoint : name;
        return fixedFromCharCode(codePt);
    }

    static GetNumber(value: number, base: number): string {
        return value.toString().split('').map((c: string) => fixedFromCharCode(parseInt(c) + base)).join();
    }

    static GetTimeSignatureNumber(value: number): string {
        return Smufl.GetNumber(value, glyphes['timeSig0'].codepoint);
    }

    static GetTupletNumber(value: number): string {
        return Smufl.GetNumber(value, glyphes['tuplet0'].codepoint);
    }

    static GetNoteValue(noteValue: BaseNoteValue): string {
        switch (noteValue) {
            case BaseNoteValue.Large:
                return Smufl.GetCharacter('noteDoubleWhole');    //todo: smufl does not provide an individual large note
            case BaseNoteValue.Long:
                return Smufl.GetCharacter('noteDoubleWhole');    //todo: smufl does not provide an individual large note
            case BaseNoteValue.Double:
                return Smufl.GetCharacter('noteDoubleWhole');
            case BaseNoteValue.Whole:
                return Smufl.GetCharacter('noteWhole');
            case BaseNoteValue.Half:
                return Smufl.GetCharacter('noteHalfUp');
            case BaseNoteValue.Quater:
                return Smufl.GetCharacter('noteQuarterUp');
            case BaseNoteValue.Eighth:
                return Smufl.GetCharacter('note8thUp');
            case BaseNoteValue.Sixteenth:
                return Smufl.GetCharacter('note16thUp');
            case BaseNoteValue.ThirtySecond:
                return Smufl.GetCharacter('note32ndUp');
            case BaseNoteValue.SixtyFourth:
                return Smufl.GetCharacter('note64thUp');
            case BaseNoteValue.HundredTwentyEighth:
                return Smufl.GetCharacter('note128thUp');
            case BaseNoteValue.TwoHundredFiftySixth:
                return Smufl.GetCharacter('note256thUp');
            default:
                throw new Error();
        }
    }

    static GetBeatModifier(beatModifier: BeatModifier, direction: VerticalDirection): string {
        switch (beatModifier) {
            case BeatModifier.Accent:
                return Smufl.GetCharacter(direction == VerticalDirection.Above ? "articAccentAbove" : "articAccentBelow");
            case BeatModifier.Marcato:
                return Smufl.GetCharacter(direction == VerticalDirection.Above ? "articMarcatoAbove" : "articMarcatoBelow");
            case BeatModifier.Staccato:
                return Smufl.GetCharacter(direction == VerticalDirection.Above ? "articStaccatoAbove" : "articStaccatoBelow");
            case BeatModifier.Staccatissimo:
                return Smufl.GetCharacter(direction == VerticalDirection.Above ? "articStaccatissimoAbove" : "articStaccatissimoBelow");
            case BeatModifier.Tenuto:
                return Smufl.GetCharacter(direction == VerticalDirection.Above ? "articTenutoAbove" : "articTenutoBelow");
            case BeatModifier.Fermata:
                return Smufl.GetCharacter(direction == VerticalDirection.Above ? "fermataAbove" : "fermataBelow");
            case BeatModifier.PickstrokeDown:
                return Smufl.GetCharacter("stringsDownBow");
            case BeatModifier.PickstrokeUp:
                return Smufl.GetCharacter("stringsUpBow");
            case BeatModifier.Trill:
                return Smufl.GetCharacter("ornamentTrill");
            case BeatModifier.Mordent:
                return Smufl.GetCharacter("ornamentMordent");
            case BeatModifier.LowerMordent:
                return Smufl.GetCharacter("ornamentMordentInverted");
            case BeatModifier.Turn:
                return Smufl.GetCharacter("ornamentTurn");
            case BeatModifier.InvertedTurn:
                return Smufl.GetCharacter("ornamentTurnInverted");
            default:
                throw new Error();
        }
    }

    static GetRest(noteValue: BaseNoteValue): string {
        return Smufl.GetCharacter(glyphes['restWhole'].codepoint - noteValue);
    }
}
