import { Element } from "../Element";
import { ChordFingeringNote } from "./ChordFingeringNote";
import { L } from "../../Utilities/LinqLite";

export class ChordFingering extends Element {
    notes: ChordFingeringNote[];

    clone(): ChordFingering {
        const clone = new ChordFingering();
        clone.notes = L(this.notes).select(n => n.clone()).toArray();
        return clone;
    }
}