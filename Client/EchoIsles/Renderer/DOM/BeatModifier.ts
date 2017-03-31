import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { BeatModifier as CoreBeatModifier } from "../../Core/MusicTheory/BeatModifier";

export class BeatModifier extends WidgetBase {

    relativePosition: Point;

    constructor(parent: WidgetBase, readonly modifier: CoreBeatModifier) {
        super(parent);
    }

}