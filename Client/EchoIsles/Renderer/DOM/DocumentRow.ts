import { WidgetBase } from "../WidgetBase";
import { Bar } from "./Bar";
import { Size } from "../Size";
import { Rect } from "../Rect";
import { BarLineBase } from "./BarLines/BarLineBase";
import { BarLine as CoreBarLine } from "../../Core/MusicTheory/BarLine";
import { HeightMap } from "./HeightMap";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { Point } from "../Point";
import { DocumentRowChild } from "./DocumentRowChild";
import { BarLine } from "./BarLines/BarLine";
import { getBarBodyHeight } from "./Utilities";
import { EmptyBar } from "./EmptyBar";
import { DocumentRowPosition } from "./DocumentRowPosition";
import { Style } from "../Style";
const heightMapSampleRate = 1;

export class DocumentRow extends WidgetBase {

    rowPosition: DocumentRowPosition;

    private readonly bars = new Array<Bar>();
    private readonly barLines = new Array<BarLineBase>();
    private readonly heightMaps = new Array<HeightMap>(2);
    private _desiredCeilingSize: number;
    private _desiredFloorSize: number;
    //private fillBar: EmptyBar;

    get barCount(): number {
        return this.bars.length;
    }

    get desiredCeilingSize(): number {
        return this._desiredCeilingSize;
    }

    get desiredFloorSize(): number {
        return this._desiredFloorSize;
    }

    addBar(bar: Bar): void {
        if (this.bars.length === 0) {
            if (bar.bar.previousBar
                && bar.bar.previousBar.closeLine === CoreBarLine.BeginAndEndRepeat) {
                this.barLines.push(BarLine.create(this, CoreBarLine.BeginRepeat));
            } else {
                this.barLines.push(BarLine.create(this, CoreBarLine.merge(undefined, bar.bar.openLine)));
            }
        } else {
            this.barLines.push(BarLine.create(this, CoreBarLine.merge(this.bars[this.bars.length - 1].bar.closeLine, bar.bar.openLine)));
        }

        this.bars.push(bar);
        bar.ownerRow = this;
    }

    seal(width: number): void {
        const lastBar = this.bars[this.bars.length - 1];

        if (lastBar.bar.closeLine === CoreBarLine.BeginAndEndRepeat) {
            this.barLines.push(BarLine.create(this, CoreBarLine.EndRepeat));
        } else {
            this.barLines.push(BarLine.create(this, CoreBarLine.merge(lastBar.bar.closeLine)));
        }

        // by this time, all the bars should be measured
        let maxBarWidth = 0;
        let sumBarWidth = 0;
        for (let bar of this.bars) {
            const desiredWidth = bar.desiredWidth;
            maxBarWidth = Math.max(maxBarWidth, desiredWidth);
            sumBarWidth += desiredWidth;
        }

        if (Style.current.row.fillEmptySpaceForLastRow
            && this.bars.length < Style.current.row.preferredBarsPerRow
            && this.rowPosition === DocumentRowPosition.Tail
            && width - sumBarWidth >= maxBarWidth) {
            //todo: add an empty bar to fill empty spaces
            //this.fillBar = new EmptyBar(this);
            //this.barLines.push(BarLine.create(this, CoreBarLine.Standard));
        }

        this.invalidateLayout();
    }

    private *getLayoutChildren(): IterableIterator<DocumentRowChild> {
        for (let i = 0; i < this.barLines.length; ++i) {
            yield this.barLines[i];

            if (i !== this.barLines.length - 1) {
                yield this.bars[i];
            }
        }
    }

    getHeightMap(voicePart: VoicePart): HeightMap {
        return this.heightMaps[voicePart];
    }

    private initializeHeightMaps(width: number) {
        for (let i = 0; i < this.heightMaps.length; ++i) {
            this.heightMaps[i] = new HeightMap(Math.ceil(width), heightMapSampleRate, 0);
        }
    }

    protected measureOverride(availableSize: Size): Size {

        this.initializeHeightMaps(availableSize.width);

        this._desiredCeilingSize = 0;
        this._desiredFloorSize = 0;

        // measure bar lines first
        for (let barLine of this.barLines) {
            barLine.measure(new Size(Number.NaN, availableSize.height));
            this._desiredCeilingSize = Math.max(this._desiredCeilingSize, barLine.desiredCeilingSize);
            this._desiredFloorSize = Math.max(this._desiredFloorSize, barLine.desiredFloorSize);
        }

        this.barLines[0].relativePosition = Point.zero;
        const lastBar = this.barLines[this.barLines.length - 1];
        lastBar.relativePosition = new Point(availableSize.width - lastBar.desiredSize.width, 0);

        let desiredWidth = 0;

        for (let i = 0; i < this.bars.length; ++i) {
            const bar = this.bars[i];
            bar.relativePosition = new Point(desiredWidth, 0);
            bar.measure(new Size(availableSize.width - desiredWidth, availableSize.height));
            desiredWidth += bar.desiredSize.width;
            this._desiredCeilingSize = Math.max(this._desiredCeilingSize, bar.desiredCeilingSize);
            this._desiredFloorSize = Math.max(this._desiredFloorSize, bar.desiredFloorSize);

            if (i !== this.bars.length - 1) {
                // place the next bar line in between of this and next bar
                const nextBarLine = this.barLines[i + 1];
                nextBarLine.relativePosition = new Point(desiredWidth - nextBarLine.desiredSize.width / 2, 0);
            }
        }

        for (let child of this.getLayoutChildren()) {
            child.relativeBaseline = this._desiredCeilingSize;
        }

        const desiredHeight = getBarBodyHeight()
            + this._desiredCeilingSize
            + this._desiredFloorSize;

        return new Size(desiredWidth, desiredHeight);
    }

    private calculateMinimumBarWidth(finalWidth: number): number {
        const sortedBars = [...this.bars];
        sortedBars.sort((a, b) => a.desiredSize.width - b.desiredSize.width);
        let sumFixedWidth = 0;
        let minimumWidth = 0;
        for (let i = sortedBars.length; i >= 1; --i) {
            minimumWidth = (finalWidth - sumFixedWidth) / i;
            const potentialFixedWidth = sortedBars[i - 1].desiredSize.width;
            if (potentialFixedWidth <= minimumWidth)
                break;

            sumFixedWidth += potentialFixedWidth;
        }

        return minimumWidth;
    }

    private arrangeElement(element: DocumentRowChild, x: number, size: Size) {
        element.relativePosition = new Point(x, 0);
        element.relativeBaseline = this.desiredCeilingSize;
        element.arrange(Rect.create(this.position.translate(element.relativePosition), size));
    }

    protected arrangeOverride(finalSize: Size): Size {

        this.initializeHeightMaps(finalSize.width);

        const firstBarLine = this.barLines[0];
        this.arrangeElement(firstBarLine, 0, firstBarLine.desiredSize);

        const lastBarLine = this.barLines[this.barLines.length - 1];
        this.arrangeElement(lastBarLine, finalSize.width - lastBarLine.desiredSize.width, lastBarLine.desiredSize);

        const minimumBarWidth = this.calculateMinimumBarWidth(finalSize.width);

        let renderWidth = 0;

        for (let i = 0; i < this.bars.length; ++i) {
            const bar = this.bars[i];
            const size = new Size(Math.max(bar.desiredSize.width, minimumBarWidth), finalSize.height);
            this.arrangeElement(bar, renderWidth, size);
            renderWidth += bar.renderSize.width;

            if (i !== this.bars.length - 1) {
                // place the next bar line in between of this and next bar
                const nextBarLine = this.barLines[i + 1];
                this.arrangeElement(nextBarLine,
                    renderWidth - nextBarLine.desiredSize.width / 2,
                    nextBarLine.desiredSize);
            }
        }

        return new Size(renderWidth, this.desiredSize.height);
    }

    destroy(): void {
        this.barLines.forEach(l => l.destroy());
    }
}
