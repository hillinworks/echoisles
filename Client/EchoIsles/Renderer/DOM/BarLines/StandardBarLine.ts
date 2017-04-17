import { BarLineBase } from "./BarLineBase";
import { DocumentRow } from "../DocumentRow";
import { BarLine as CoreBarLine } from "../../../Core/MusicTheory/BarLine";
import { Size } from "../../Size";

export class StandardBarLine extends BarLineBase {
    private line: fabric.Line;

    public constructor(ownerRow: DocumentRow, readonly barLine: CoreBarLine.Standard) {
        super(ownerRow);
        this.initializeComponents();
    }

    private initializeComponents() {
        this.line = this.createThinLine();
    }

    protected measureElementsWidth(availableSize: Size): number {
        return this.line.strokeWidth!;
    }
    
    protected arrangeOverride(finalSize: Size): Size {
        this.arrangeLine(this.line, 0, finalSize);
        return finalSize;
    }
}