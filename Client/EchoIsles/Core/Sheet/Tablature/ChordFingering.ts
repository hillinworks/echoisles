import { Element } from "../Element";
import { ChordFingeringNote } from "./ChordFingeringNote";
import { L } from "../../Utilities/LinqLite";
import { IChordFingering } from "./IChordFingering";

export class ChordFingering extends Element implements IChordFingering {
    notes: ChordFingeringNote[];

    clone(): ChordFingering {
        const clone = new ChordFingering();
        clone.notes = L(this.notes).select(n => n.clone()).toArray();
        return clone;
    }
}