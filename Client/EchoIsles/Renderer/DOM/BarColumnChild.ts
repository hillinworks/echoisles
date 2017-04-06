import { Point } from "../Point";
import { Bar } from "./Bar";
import { WidgetBase } from "../WidgetBase";
import { DocumentRow } from "./DocumentRow";
import { IBarDescendant } from "./IBarDescendant";
import { BarColumn } from "./BarColumn";

export abstract class BarColumnChild extends WidgetBase implements IBarDescendant {

    /** the position relative to the baseline of owner bar column */
    relativePosition: Point;

    protected constructor(readonly ownerBarColumn: BarColumn) {
        super(ownerBarColumn);
    }

    get ownerBar(): Bar {
        return this.ownerBarColumn.ownerBar;
    }

    get ownerRow(): DocumentRow {
        return this.ownerBar.ownerRow;
    }
}

