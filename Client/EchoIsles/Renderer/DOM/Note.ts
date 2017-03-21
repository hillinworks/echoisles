import { WidgetBase } from "../WidgetBase";
import { BeatNote as CoreNote } from "../../Core/Sheet/BeatNote";
export class Note extends WidgetBase {

    constructor(parent: WidgetBase, readonly note: CoreNote, readonly isVirtual: boolean) {
        super(parent);
    }

}