import { Note } from "./Note";
import { BarColumn } from "./BarColumn";
import {BarColumnChild} from "./BarColumnChild";

export class LongNoteEllipse extends BarColumnChild {

    constructor(owner: BarColumn, readonly notes: Note[]) {
        super(owner);
    }
}