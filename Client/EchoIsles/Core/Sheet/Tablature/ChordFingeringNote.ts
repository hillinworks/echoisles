import { Element } from "../Element";
import { LeftHandFingerIndex } from "../../Player/LeftHandFingerIndex";


export class ChordFingeringNote extends Element {
    fret: number;
    fingerIndex?: LeftHandFingerIndex;
    isImportant: boolean;

    constructor(fret: number, fingerIndex?: LeftHandFingerIndex, isImportant = false) {
        super();
        this.fret = fret;
        this.fingerIndex = fingerIndex;
        this.isImportant = isImportant;
    }

    clone(): ChordFingeringNote {
        const clone = new ChordFingeringNote(this.fret, this.fingerIndex, this.isImportant);
        clone.range = this.range;
        return clone;
    }
}