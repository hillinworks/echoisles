import { ChordDefinition } from "./ChordDefinition";
import { toMap } from "../../Utilities/LinqLite";
import { IChordDefinition } from "./IChordDefinition";

export class ChordLibrary {
    private readonly chords: { [key: string]: ChordDefinition } = {};

    constructor(chords: ChordDefinition[]) {
        this.chords = toMap(chords, c => c.name);
    }

    resolve(chordName:string): IChordDefinition | undefined {
        return this.chords[chordName];
    }
}