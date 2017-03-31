import { BarLine as CoreBarLine } from "../../Core/MusicTheory/BarLine";
import { DocumentRow } from "./DocumentRow";

export class BarLine extends DocumentRow.Child {

    constructor(parent: DocumentRow, private readonly barLine: CoreBarLine) {
        super(parent);
    }

}