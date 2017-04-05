import { WidgetBase } from "../WidgetBase";
import { IChordDefinition } from "../../Core/Sheet/Tablature/IChordDefinition";

export class ChordDiagram extends WidgetBase {
    constructor(owner: WidgetBase, readonly chord: IChordDefinition) {
        super(owner);
    }
}