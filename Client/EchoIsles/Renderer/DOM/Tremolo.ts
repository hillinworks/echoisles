import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import {IBarRelated} from "./IBarRelated";

export class Tremolo extends WidgetBase implements IBarRelated {
    barRelatedPosition: Point;

    constructor(parent: WidgetBase) {
        super(parent);
    }

}