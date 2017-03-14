import { Element } from "../Element";
import { ChordFingeringNote } from "./ChordFingeringNote";

export class ChordFingering extends Element {
    notes: ChordFingeringNote[];

    clone(): ChordFingering {
        const clone = new ChordFingering();
        clone.notes = this.notes.map(n => n.clone());
        return clone;
    }
}