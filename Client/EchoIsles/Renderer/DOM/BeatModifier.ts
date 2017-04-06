import { WidgetBase } from "../WidgetBase";
import { BeatModifier as CoreBeatModifier } from "../../Core/MusicTheory/BeatModifier";
import { Point } from "../Point";
import {IBarRelated} from "./IBarRelated";

export class BeatModifier extends WidgetBase implements IBarRelated {
    barRelatedPosition: Point;

    constructor(parent: WidgetBase, readonly modifier: CoreBeatModifier) {
        super(parent);
    }

}