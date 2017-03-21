import { WidgetBase } from "../WidgetBase";
import { BarLine as CoreBarLine } from "../../Core/MusicTheory/BarLine";
import { DocumentRowElement } from "./DocumentRowElement";

export class BarLine extends DocumentRowElement {

    constructor(parent: WidgetBase, private readonly barLine: CoreBarLine) {
        super(parent);
    }

}