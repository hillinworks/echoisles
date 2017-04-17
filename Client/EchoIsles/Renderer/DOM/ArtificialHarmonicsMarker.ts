import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { IBarRelated } from "./IBarRelated";

export class ArtificialHarmonicsMarker extends WidgetBase implements IBarRelated {

    barRelatedPosition: Point;

    constructor(parent: WidgetBase, readonly fret?: number) {
        super(parent);
    }

}