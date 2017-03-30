import { Note } from "./Note";
import { BarColumn } from "./BarColumn";

export class LongNoteEllipse extends BarColumn.Child {

    constructor(owner: BarColumn, readonly notes: Note[]) {
        super(owner);
    }
}