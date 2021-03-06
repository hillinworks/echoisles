﻿import { BarLineBase } from "./BarLineBase";
import { DocumentRow } from "../DocumentRow";
import { BarLine as CoreBarLine } from "../../../Core/MusicTheory/BarLine";
import { Size } from "../../Size";
import { Style } from "../../Style";
import { RepeatSign } from "./RepeatSign";

export class BeginRepeatAndEndBarLine extends BarLineBase {
    private line1: fabric.Line;
    private line2: fabric.Line;
    private line3: fabric.Line;
    private repeatSign: RepeatSign;

    public constructor(ownerRow: DocumentRow, readonly barLine: CoreBarLine.BeginRepeatAndEnd) {
        super(ownerRow);
        this.initializeComponents();
    }

    private initializeComponents() {
        this.line1 = this.createThinLine();
        this.line2 = this.createThickLine();
        this.line3 = this.createThinLine();
        this.repeatSign = this.createRepeatSign();
    }

    protected measureElementsWidth(availableSize: Size): number {
        this.repeatSign.measure(availableSize);
        return this.line1.strokeWidth
            + Style.current.barLine.lineSpacing
            + this.line2.strokeWidth
            + Style.current.barLine.lineSpacing
            + this.line3.strokeWidth
            + Style.current.barLine.repeatSpacing
            + this.repeatSign.desiredSize.width;
    }

    protected arrangeOverride(finalSize: Size): Size {
        let x = 0;
        this.arrangeLine(this.line1, x, finalSize);
        x += this.line1.strokeWidth + Style.current.barLine.lineSpacing;
        this.arrangeLine(this.line2, x, finalSize);
        x += this.line2.strokeWidth + Style.current.barLine.lineSpacing;
        this.arrangeLine(this.line3, x, finalSize);
        x += this.line3.strokeWidth + Style.current.barLine.repeatSpacing;
        this.arrangeRepeatSign(this.repeatSign, x);
        return finalSize;
    }
}