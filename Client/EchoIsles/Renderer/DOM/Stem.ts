import { WidgetBase } from "../WidgetBase";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Size } from "../Size";
import { Style } from "../Style";
import {Point} from "../Point";
import {IBarRelated} from "./IBarRelated";

export class Stem extends WidgetBase implements IBarRelated {

    barRelatedPosition: Point;

    constructor(parent: WidgetBase, readonly noteValue: BaseNoteValue) {
        super(parent);
    }

    protected measureOverride(availableSize: Size): Size {
        return new Size(Style.current.note.stem.thickness, availableSize.height);
    }
}