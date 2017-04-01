import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { Bar } from "./Bar";

export class ArtificialHarmonicsMarker extends WidgetBase implements Bar.IBarRelated {

    relativePosition: Point;

    constructor(parent: WidgetBase, readonly fret?: number) {
        super(parent);
    }

}