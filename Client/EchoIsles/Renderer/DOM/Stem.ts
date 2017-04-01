import { WidgetBase } from "../WidgetBase";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Size } from "../Size";
import { Style } from "../Style";
import { Bar } from "./Bar";
import {Point} from "../Point";

export class Stem extends WidgetBase implements Bar.IBarRelated {

    relativePosition: Point;

    constructor(parent: WidgetBase, readonly noteValue: BaseNoteValue) {
        super(parent);
    }

    protected measureOverride(availableSize: Size): Size {
        return new Size(Style.current.note.stem.thickness, availableSize.height);
    }
}