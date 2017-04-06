import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import {IBarRelated} from "./IBarRelated";

export class Tuplet extends WidgetBase implements IBarRelated {
    barRelatedPosition: Point;

    constructor(parent: WidgetBase, readonly tuplet: number) {
        super(parent);
    }
}