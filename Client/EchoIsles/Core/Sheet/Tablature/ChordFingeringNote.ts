import { Element } from "../Element";
import { LeftHandFingerIndex } from "../../Player/LeftHandFingerIndex";
import { IChordFingeringNote } from "./IChordFingeringNote";

export class ChordFingeringNote extends Element implements IChordFingeringNote {

    constructor(public fret: number, public fingerIndex?: LeftHandFingerIndex, public isImportant = false) {
        super();
    }

    clone(): ChordFingeringNote {
        const clone = new ChordFingeringNote(this.fret, this.fingerIndex, this.isImportant);
        clone.range = this.range;
        return clone;
    }
}