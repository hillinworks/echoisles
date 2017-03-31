import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Size } from "../Size";
import { Style } from "../Style";

export class Stem extends WidgetBase {

    relativePosition: Point;

    constructor(parent: WidgetBase, readonly noteValue: BaseNoteValue) {
        super(parent);
    }

    protected measureOverride(availableSize: Size): Size {
        return new Size(Style.current.note.stem.thickness, availableSize.height);
    }
}