import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import {IBarRelated} from "./IBarRelated";

export class Flag extends WidgetBase implements IBarRelated {

    barRelatedPosition: Point;

    constructor(parent: WidgetBase, readonly noteValue: BaseNoteValue) {
        super(parent);
    }

}