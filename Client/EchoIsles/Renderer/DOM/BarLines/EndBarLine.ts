import { BarLineBase } from "./BarLineBase";
import { DocumentRow } from "../DocumentRow";
import { BarLine as CoreBarLine } from "../../../Core/MusicTheory/BarLine";
import { Size } from "../../Size";
import { Style } from "../../Style";

export class EndBarLine extends BarLineBase {
    private line1: fabric.Line;
    private line2: fabric.Line;

    public constructor(ownerRow: DocumentRow, readonly barLine: CoreBarLine.End) {
        super(ownerRow);
        this.initializeComponents();
    }

    private initializeComponents() {
        this.line1 = this.createThinLine();
        this.line2 = this.createThickLine();
    }

    protected measureElementsWidth(availableSize: Size): number {
        return this.line1.strokeWidth! + Style.current.barLine.lineSpacing + this.line2.strokeWidth;
    }

    protected arrangeOverride(finalSize: Size): Size {
        this.arrangeLine(this.line1, 0, finalSize);
        this.arrangeLine(this.line2, this.line1.strokeWidth + Style.current.barLine.lineSpacing, finalSize);

        return finalSize;
    }
}