import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { Bar } from "./Bar";

export class Tremolo extends WidgetBase implements Bar.IBarRelated {
    barRelatedPosition: Point;

    constructor(parent: WidgetBase) {
        super(parent);
    }

}