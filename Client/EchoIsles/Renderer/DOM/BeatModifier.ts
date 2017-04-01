import { WidgetBase } from "../WidgetBase";
import { BeatModifier as CoreBeatModifier } from "../../Core/MusicTheory/BeatModifier";
import { Bar } from "./Bar";
import { Point } from "../Point";

export class BeatModifier extends WidgetBase implements Bar.IBarRelated {
    relativePosition: Point;

    constructor(parent: WidgetBase, readonly modifier: CoreBeatModifier) {
        super(parent);
    }

}