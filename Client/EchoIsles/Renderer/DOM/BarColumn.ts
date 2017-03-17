import { WidgetBase } from "../WidgetBase";
import { BarColumn as CoreBarColumn } from "../../Core/Sheet/BarColumn";

export class BarColumn extends WidgetBase {

    constructor(parent: WidgetBase, readonly barColumn: CoreBarColumn) {
        super(parent);
    }
}