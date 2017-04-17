import { IChordDefinition } from "./IChordDefinition";
import { Chord } from "./Chord";
import { IChordFingering } from "./IChordFingering";

export class InlineChordDefinition implements IChordDefinition {
    constructor(private readonly chord: Chord) { }

    get displayName(): string {
        return this.chord.name || "";
    }

    get fingering(): IChordFingering {
        return this.chord.fingering!;
    }
}