import { NoteName } from "./NoteName";
import { Interval } from "./Interval";
import { BaseNoteName } from "./BaseNoteName";
import { Accidental } from "./Accidental";


export const neutralOctaveGroup = -1;

export class Pitch {


    readonly noteName: NoteName;
    readonly octaveGroup: number;

    constructor(noteName: NoteName, octaveGroup: number) {
        this.noteName = noteName;
        this.octaveGroup = octaveGroup;
    }

    withOctave(octaveGroup: number): Pitch {
        return new Pitch(this.noteName, octaveGroup);
    }

    get normalizedSemitones(): number {
        return this.noteName.semitones;
    }

    get semitones(): number {
        return this.octaveGroup * 12 + this.noteName.semitones;
    }

    equals(other: Pitch): boolean {
        return other && this.noteName.equals(other.noteName) && this.octaveGroup === other.octaveGroup;
    }

    toString(): string {
        return `${this.noteName.toString()}${this.octaveGroup}`;
    };

    enharmoniclyEquals(other: Pitch): boolean {
        return this.octaveGroup === other.octaveGroup && this.normalizedSemitones === other.normalizedSemitones;
    }

    offset(interval: Interval): Pitch {
        if (Accidental.getIsDoubleAccidental(this.noteName.accidental))
            throw new Error("offset is not available to pitches with double accidental");

        const semitones = this.semitones + interval.semitoneOffset;
        const degrees = BaseNoteName.getAbsoluteDegrees(this.noteName.baseName) + interval.normalizedNumber;
        return Pitch.resolve(semitones, degrees);
    }
}


export module Pitch {

    // ReSharper disable InconsistentNaming
    export function C(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.C, octaveGroup); }
    export function D(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.D, octaveGroup); }
    export function E(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.E, octaveGroup); }
    export function F(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.F, octaveGroup); }
    export function G(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.G, octaveGroup); }
    export function A(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.A, octaveGroup); }
    export function B(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.B, octaveGroup); }
    export function CSharp(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.CSharp, octaveGroup); }
    export function DSharp(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.DSharp, octaveGroup); }
    export function ESharp(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.ESharp, octaveGroup); }
    export function FSharp(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.FSharp, octaveGroup); }
    export function GSharp(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.GSharp, octaveGroup); }
    export function ASharp(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.ASharp, octaveGroup); }
    export function BSharp(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.BSharp, octaveGroup); }
    export function CFlat(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.CFlat, octaveGroup); }
    export function DFlat(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.DFlat, octaveGroup); }
    export function EFlat(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.EFlat, octaveGroup); }
    export function FFlat(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.FFlat, octaveGroup); }
    export function GFlat(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.GFlat, octaveGroup); }
    export function AFlat(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.AFlat, octaveGroup); }
    export function BFlat(octaveGroup: number = neutralOctaveGroup) { return new Pitch(NoteName.BFlat, octaveGroup); }
    // ReSharper restore InconsistentNaming

    export function resolve(semitones: number, degreeToSnap?: number): Pitch {
        return new Pitch(NoteName.fromSemitones(semitones, degreeToSnap), semitones / 12);
    }

}