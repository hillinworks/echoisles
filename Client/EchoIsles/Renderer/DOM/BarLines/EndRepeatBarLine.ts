import { BarLineBase } from "./BarLineBase";
import { DocumentRow } from "../DocumentRow";
import { BarLine as CoreBarLine } from "../../../Core/MusicTheory/BarLine";
import { Size } from "../../Size";
import { Style } from "../../Style";
import { RepeatSign } from "./RepeatSign";

export class EndRepeatBarLine extends BarLineBase {
    private line1: fabric.Line;
    private line2: fabric.Line;
    private repeatSign: RepeatSign;

    public constructor(ownerRow: DocumentRow, readonly barLine: CoreBarLine.EndRepeat) {
        super(ownerRow);
        this.initializeComponents();
    }

    private initializeComponents() {
        this.repeatSign = this.createRepeatSign();
        this.line1 = this.createThinLine();
        this.line2 = this.createThickLine();
    }

    protected measureElementsWidth(availableSize: Size): number {
        this.repeatSign.measure(availableSize);
        return this.repeatSign.desiredSize.width
            + Style.current.barLine.repeatSpacing
            + this.line1.strokeWidth!
            + +Style.current.barLine.lineSpacing
            + this.line2.strokeWidth;
    }

    protected arrangeOverride(finalSize: Size): Size {
        let x = 0;
        this.arrangeRepeatSign(this.repeatSign, x);
        x += this.repeatSign.desiredSize.width + Style.current.barLine.repeatSpacing;
        this.arrangeLine(this.line1, x, finalSize);
        x += this.line1.strokeWidth + Style.current.barLine.lineSpacing;
        this.arrangeLine(this.line2, x, finalSize);
        
        return finalSize;
    }
}