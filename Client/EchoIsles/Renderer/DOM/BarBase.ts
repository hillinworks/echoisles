import { DocumentRowChild } from "./DocumentRowChild";
import { BarHorizontalLine } from "./BarHorizontalLine";
import { Defaults } from "../../Core/Sheet/Tablature/Defaults";
import { DocumentRow } from "./DocumentRow";
import { WidgetBase } from "../WidgetBase";

export abstract class BarBase extends DocumentRowChild {
    protected readonly horizontalLines = new Array<Array<BarHorizontalLine>>();

    ownerRow: DocumentRow;

    protected constructor(parent: WidgetBase) {
        super(parent);
        this.initializeHorizontalLines();
    }

    private initializeHorizontalLines() {

        for (let i = 0; i < Defaults.strings; ++i) {
            this.horizontalLines[i] = new Array<BarHorizontalLine>();
            this.horizontalLines[i].push(new BarHorizontalLine(this));
        }
    }

    destroy(): void {
        this.destroyChildren(...this.horizontalLines);
    }
}