import { BarLine as CoreBarLine } from "../../Core/MusicTheory/BarLine";
import { DocumentRow } from "./DocumentRow";
import { DocumentRowChild } from "./DocumentRowChild";

export class BarLine extends DocumentRowChild {

    constructor(readonly ownerRow: DocumentRow, readonly barLine: CoreBarLine) {
        super(ownerRow);
    }

}