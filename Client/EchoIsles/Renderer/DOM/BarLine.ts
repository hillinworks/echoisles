import { BarLine as CoreBarLine } from "../../Core/MusicTheory/BarLine";
import { DocumentRow } from "./DocumentRow";

export class BarLine extends DocumentRow.Child {

    constructor(readonly ownerRow: DocumentRow, readonly barLine: CoreBarLine) {
        super(ownerRow);
    }

}