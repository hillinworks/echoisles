import { IChordDefinition } from "../../Core/Sheet/Tablature/IChordDefinition";
import { Bar } from "./Bar";
import { BarChild } from "./BarChild";

export class ChordDiagram extends BarChild {
    constructor(owner: Bar, readonly chord: IChordDefinition) {
        super(owner);
    }
}