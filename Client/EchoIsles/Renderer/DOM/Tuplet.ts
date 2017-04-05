import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { Bar } from "./Bar";

export class Tuplet extends WidgetBase implements Bar.IBarRelated {
    barRelatedPosition: Point;

    constructor(parent: WidgetBase, readonly tuplet: number) {
        super(parent);
    }
}