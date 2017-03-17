import { WidgetBase } from "../WidgetBase";
import { BarLine as CoreBarLine } from "../../Core/MusicTheory/BarLine";

export class BarLine extends WidgetBase {

    constructor(parent: WidgetBase, private readonly barLine: CoreBarLine) {
        super(parent);
    }

}