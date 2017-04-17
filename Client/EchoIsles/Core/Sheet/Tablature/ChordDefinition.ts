import { Element } from "../Element";
import { ChordFingering } from "./ChordFingering";
import { IChordDefinition } from "./IChordDefinition";

export class ChordDefinition extends Element implements IChordDefinition {
    name: string;
    private _displayName: string;
    fingering: ChordFingering;

    get displayName(): string {
        return this._displayName !== undefined && this._displayName.length > 0 ? this._displayName : this.name;
    }

    set displayName(value: string) {
        this._displayName = value;
    }

}