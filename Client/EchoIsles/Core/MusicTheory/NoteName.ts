import { BaseNoteName } from "./BaseNoteName";
import { Accidental } from "./Accidental";
import { StringUtilities } from "../Utilities/StringUtilities";
import { Interval } from "./Interval";

export class NoteName {

    readonly baseName: BaseNoteName;
    readonly accidental: Accidental;

    constructor(baseName: BaseNoteName, accidental: Accidental) {
        this.baseName = baseName;
        this.accidental = accidental;
    }


    get semitones(): number {
        return (BaseNoteName.getSemitones(this.baseName) + Accidental.getSemitoneOffset(this.accidental) + 12) % 12;
    }

    equals(other: NoteName): boolean {
        return other && this.baseName === other.baseName && this.accidental === other.accidental;
    }

    enharmoniclyEquals(other: NoteName): boolean {
        return other && this.semitones === other.semitones;
    }

    offset(interval: Interval): NoteName {
        if (Accidental.getIsDoubleAccidental(this.accidental))
            throw new Error("offset operator is not available to note names with double accidental");
        const semitones = this.semitones + interval.semitoneOffset;
        const degrees = BaseNoteName.getAbsoluteDegrees(this.baseName) + interval.normalizedNumber;
        return NoteName.fromSemitones(semitones, degrees);
    }

    toString(): string {
        switch (this.accidental) {
            case Accidental.Sharp:
                return `${this.baseName}♯`;
            case Accidental.Flat:
                return `${this.baseName}♭`;
            case Accidental.DoubleSharp:
                return `${this.baseName}${StringUtilities.fixedFromCharCode(0x1d12a)}`;
            case Accidental.DoubleFlat:
                return `${this.baseName}${StringUtilities.fixedFromCharCode(0x1d12b)}`;
            case Accidental.Natural:
            default:
                return BaseNoteName[this.baseName];
        }
    }
}

export module NoteName {


    // ReSharper disable InconsistentNaming
    export const C = new NoteName(BaseNoteName.C, Accidental.Natural);
    export const D = new NoteName(BaseNoteName.D, Accidental.Natural);
    export const E = new NoteName(BaseNoteName.E, Accidental.Natural);
    export const F = new NoteName(BaseNoteName.F, Accidental.Natural);
    export const G = new NoteName(BaseNoteName.G, Accidental.Natural);
    export const A = new NoteName(BaseNoteName.A, Accidental.Natural);
    export const B = new NoteName(BaseNoteName.B, Accidental.Natural);
    export const CSharp = new NoteName(BaseNoteName.C, Accidental.Sharp);
    export const DSharp = new NoteName(BaseNoteName.D, Accidental.Sharp);
    export const ESharp = new NoteName(BaseNoteName.E, Accidental.Sharp);
    export const FSharp = new NoteName(BaseNoteName.F, Accidental.Sharp);
    export const GSharp = new NoteName(BaseNoteName.G, Accidental.Sharp);
    export const ASharp = new NoteName(BaseNoteName.A, Accidental.Sharp);
    export const BSharp = new NoteName(BaseNoteName.B, Accidental.Sharp);
    export const CFlat = new NoteName(BaseNoteName.C, Accidental.Flat);
    export const DFlat = new NoteName(BaseNoteName.D, Accidental.Flat);
    export const EFlat = new NoteName(BaseNoteName.E, Accidental.Flat);
    export const FFlat = new NoteName(BaseNoteName.F, Accidental.Flat);
    export const GFlat = new NoteName(BaseNoteName.G, Accidental.Flat);
    export const AFlat = new NoteName(BaseNoteName.A, Accidental.Flat);
    export const BFlat = new NoteName(BaseNoteName.B, Accidental.Flat);
    export const CDoubleSharp = new NoteName(BaseNoteName.C, Accidental.DoubleSharp);
    export const DDoubleSharp = new NoteName(BaseNoteName.D, Accidental.DoubleSharp);
    export const EDoubleSharp = new NoteName(BaseNoteName.E, Accidental.DoubleSharp);
    export const FDoubleSharp = new NoteName(BaseNoteName.F, Accidental.DoubleSharp);
    export const GDoubleSharp = new NoteName(BaseNoteName.G, Accidental.DoubleSharp);
    export const ADoubleSharp = new NoteName(BaseNoteName.A, Accidental.DoubleSharp);
    export const BDoubleSharp = new NoteName(BaseNoteName.B, Accidental.DoubleSharp);
    export const CDoubleFlat = new NoteName(BaseNoteName.C, Accidental.DoubleFlat);
    export const DDoubleFlat = new NoteName(BaseNoteName.D, Accidental.DoubleFlat);
    export const EDoubleFlat = new NoteName(BaseNoteName.E, Accidental.DoubleFlat);
    export const FDoubleFlat = new NoteName(BaseNoteName.F, Accidental.DoubleFlat);
    export const GDoubleFlat = new NoteName(BaseNoteName.G, Accidental.DoubleFlat);
    export const ADoubleFlat = new NoteName(BaseNoteName.A, Accidental.DoubleFlat);
    export const BDoubleFlat = new NoteName(BaseNoteName.B, Accidental.DoubleFlat);
    // ReSharper restore InconsistentNaming


    const semitoneToNoteNameLookup = [
        NoteName.C, NoteName.CSharp, NoteName.D, NoteName.DSharp, NoteName.E, NoteName.F, NoteName.FSharp, NoteName.G,
        NoteName.GSharp, NoteName.A, NoteName.ASharp, NoteName.B
    ];

    const semitoneToNoteNameSnappedToDegreeLookup: { [key: number]: NoteName }[] = [
    /*0*/  { 6: NoteName.BSharp, 0: NoteName.C, 1: NoteName.DDoubleFlat },
    /*1*/  { 6: NoteName.BDoubleSharp, 0: NoteName.CSharp, 1: NoteName.DFlat },
    /*2*/  { 0: NoteName.CDoubleSharp, 1: NoteName.D, 2: NoteName.EDoubleFlat },
    /*3*/  { 1: NoteName.DSharp, 2: NoteName.EFlat, 3: NoteName.FDoubleFlat },
    /*4*/  { 1: NoteName.DDoubleSharp, 2: NoteName.E, 3: NoteName.FFlat },
    /*5*/  { 2: NoteName.ESharp, 3: NoteName.F, 4: NoteName.GDoubleFlat },
    /*6*/  { 2: NoteName.EDoubleSharp, 3: NoteName.FSharp, 4: NoteName.GFlat },
    /*7*/  { 3: NoteName.FDoubleSharp, 4: NoteName.G, 5: NoteName.ADoubleFlat },
    /*8*/  { 4: NoteName.GSharp, 5: NoteName.AFlat },
    /*9*/  { 4: NoteName.GDoubleSharp, 5: NoteName.A, 6: NoteName.BDoubleFlat },
    /*10*/ { 5: NoteName.ASharp, 6: NoteName.BFlat, 0: NoteName.CDoubleFlat },
    /*11*/ { 5: NoteName.ADoubleSharp, 6: NoteName.B, 0: NoteName.CFlat }
    ];

    export function fromSemitones(semitones: number, degreeToSnap?: number): NoteName {
        semitones = semitones % 12;

        if (degreeToSnap === undefined)
            return semitoneToNoteNameLookup[semitones];

        const lookup = semitoneToNoteNameSnappedToDegreeLookup[semitones];

        const noteName = lookup[degreeToSnap % 7];
        if (noteName !== undefined)
            return noteName;

        throw new RangeError("cannot resolve to specified degree");
    }

}