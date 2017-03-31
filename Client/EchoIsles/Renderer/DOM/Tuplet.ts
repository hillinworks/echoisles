import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";

export class Tuplet extends WidgetBase {

    relativePosition: Point;

    constructor(parent: WidgetBase, readonly tuplet: number) {
        super(parent);
    }
}