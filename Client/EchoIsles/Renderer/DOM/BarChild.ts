import { WidgetBase } from "../WidgetBase";
import { DocumentRow } from "./DocumentRow";
import { Bar } from "./Bar";
import { IBarDescendant } from "./IBarDescendant";

export abstract class BarChild extends WidgetBase implements IBarDescendant {

    protected constructor(readonly ownerBar: Bar) {
        super(ownerBar);
    }

    get ownerRow(): DocumentRow {
        return this.ownerBar.ownerRow;
    }

}