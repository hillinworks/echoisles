import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";

export class Flag extends WidgetBase {

    relativePosition: Point;

    constructor(parent: WidgetBase, readonly noteValue: BaseNoteValue) {
        super(parent);
    }

}