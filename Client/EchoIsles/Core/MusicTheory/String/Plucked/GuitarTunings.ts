import { Tuning } from "../Tuning";
import { Pitch } from "../../Pitch";

export module GuitarTunings {
    export const standard
        = new Tuning("Standard", Pitch.E(2), Pitch.A(2), Pitch.D(3), Pitch.G(3), Pitch.B(3), Pitch.E(4));

    export const dropD
        = new Tuning("Drop D", Pitch.D(2), Pitch.A(2), Pitch.D(3), Pitch.G(3), Pitch.B(3), Pitch.E(4));

    export const knownTunings: { [key: string]: Tuning } = {};
    for (let tuning of [standard, dropD]) {
        knownTunings[tuning.name!.toLowerCase()] = tuning;
    }

    export function getKnownTunings(name: string): Tuning {
        return knownTunings[name];
    }
}