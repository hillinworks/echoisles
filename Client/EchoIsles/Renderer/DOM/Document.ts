﻿import * as fabric from "fabric";
import { WidgetBase } from "../WidgetBase";
import { DocumentRow } from "./DocumentRow";
import { Document as CoreDocument } from "../../Core/Sheet/Document";
import { Bar as CoreBar } from "../../Core/Sheet/Bar";
import { Size } from "../Size";
import { Rect } from "../Rect";
import { Vector } from "../Vector";
import { IWidgetRoot } from "../WidgetRoot";
import { select } from "../../Core/Utilities/LinqLite";
import { Point } from "../Point";
import { Bar } from "./Bar";
import { DocumentRowPosition } from "./DocumentRowPosition";
import { assert } from "../../Core/Utilities/Debug";
import { Style } from "../Style";

export class Document extends WidgetBase implements IWidgetRoot {

    readonly bars = new Array<Bar>();
    readonly rows = new Array<DocumentRow>();

    private previousAvailableWidth: number | undefined;

    constructor(private readonly document: CoreDocument, public readonly canvas: fabric.StaticCanvas) {
        super(undefined);
        this.initializeComponents();
    }

    protected get root(): IWidgetRoot {
        return this;
    }

    private createBar(bar: CoreBar): Bar {
        return new Bar(this, bar);
    }

    private initializeComponents(): void {
        this.bars.push(...select(this.document.bars, b => this.createBar(b)));
    }

    protected measureOverride(availableSize: Size): Size {
        if (this.previousAvailableWidth !== availableSize.width) {
            this.rearrangeRows(availableSize.width);
            this.previousAvailableWidth = availableSize.width;
        }

        let remainingSize = availableSize;
        let desiredSize = Size.zero;
        for (let row of this.rows) {
            row.measure(remainingSize);
            remainingSize = new Size(remainingSize.width, Math.max(0, remainingSize.height - row.desiredSize.height));
            desiredSize = new Size(
                Math.max(desiredSize.width, row.desiredSize.width),
                desiredSize.height + row.desiredSize.height);
        }

        return desiredSize;
    }

    protected arrangeOverride(finalSize: Size): Size {
        if (this.previousAvailableWidth !== finalSize.width) {
            this.rearrangeRows(finalSize.width);
            this.previousAvailableWidth = finalSize.width;
        }

        let sumHeight = 0;
        for (let row of this.rows) {
            row.arrange(Rect.create(this.position.translate(new Vector(0, sumHeight)), new Size(finalSize.width, row.desiredSize.height)));
            sumHeight += row.renderSize.height;
        }

        return new Size(finalSize.width, sumHeight);
    }

    private createRow(): DocumentRow {
        const row = new DocumentRow(this);
        this.rows.push(row);
        return row;
    }

    private rearrangeRows(width: number): void {
        for (let row of this.rows) {
            row.destroy();
        }

        if (this.bars.length === 0) {
            return;
        }

        this.rows.length = 0;

        let currentRow = this.createRow();
        currentRow.rowPosition = DocumentRowPosition.Head;
        let sumWidth = 0;

        for (let bar of this.bars) {
            bar.relativePosition = new Point(0, sumWidth);
            const barWidth = bar.preMeasure();
            sumWidth += barWidth;

            if (width <= sumWidth || Style.current.row.preferredBarsPerRow <= currentRow.barCount) {
                currentRow.seal(width);
                currentRow = this.createRow();
                currentRow.rowPosition = DocumentRowPosition.Body;
                currentRow.addBar(bar);
                sumWidth = barWidth;
            } else {
                currentRow.addBar(bar);
            }
        }

        assert(currentRow.barCount > 0);
        currentRow.rowPosition = DocumentRowPosition.Tail;
        currentRow.seal(width);

    }

    destroy() {
        this.bars.forEach(b => b.destroy());
        this.rows.forEach(r => r.destroy());
    }

}