import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Bar } from "./Bar";

export class Flag extends WidgetBase implements Bar.IBarRelated {

    relativePosition: Point;

    constructor(parent: WidgetBase, readonly noteValue: BaseNoteValue) {
        super(parent);
    }

}