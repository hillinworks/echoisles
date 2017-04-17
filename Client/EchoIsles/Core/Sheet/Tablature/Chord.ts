import { Element } from "../Element";
import { Chord as TheoreticalChord } from "../../MusicTheory/Chord";
import { ChordFingering } from "./ChordFingering";

export class Chord extends Element {
    static readonly fingeringSkipString = -1;

    name?: string;
    fingering?: ChordFingering;
    theoreticalChord: TheoreticalChord;

    clone(): Chord {
        const clone = new Chord();
        clone.name = this.name;
        clone.fingering = this.fingering;
        clone.theoreticalChord = this.theoreticalChord;

        return clone;
    }

}