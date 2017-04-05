import { WidgetBase } from "../WidgetBase";
import { Bar } from "./Bar";
import { Size } from "../Size";
import { Rect } from "../Rect";
import { BarLine } from "./BarLine";
import { BarLine as CoreBarLine } from "../../Core/MusicTheory/BarLine";
import { Style } from "../Style";
import { Defaults } from "../../Core/Sheet/Tablature/Defaults";
import { HeightMap } from "./HeightMap";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { Point } from "../Point";
const heightMapSampleRate = 1;

export class DocumentRow extends WidgetBase {

    private readonly bars = new Array<Bar>();
    private readonly barLines = new Array<BarLine>();
    private readonly heightMaps = new Array<HeightMap>(2);
    private _desiredCeilingSize: number;
    private _desiredFloorSize: number;

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
            this.barLines.push(new BarLine(this, CoreBarLine.merge(undefined, bar.bar.openLine)));
        } else {
            this.barLines.push(new BarLine(this, CoreBarLine.merge(this.bars[this.bars.length - 1].bar.closeLine, bar.bar.openLine)));
        }

        this.bars.push(bar);
        bar.ownerRow = this;
    }

    seal(width: number): void {
        this.barLines.push(new BarLine(this, CoreBarLine.merge(this.bars[this.bars.length - 1].bar.closeLine)));

        // by this time, all the bars should be measured
        let maxBarWidth = 0;
        let sumBarWidth = 0;
        for (let bar of this.bars) {
            const desiredWidth = bar.desiredSize.width;
            maxBarWidth = Math.max(maxBarWidth, desiredWidth);
            sumBarWidth += desiredWidth;
        }

        if (width - sumBarWidth >= maxBarWidth) {
            // todo: we have plenty of room left, create an empty bar here
        }

        this.invalidateLayout();
    }

    private *getLayoutChildren(): IterableIterator<DocumentRow.Child> {
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

        let desiredWidth = 0;
        this._desiredCeilingSize = 0;
        this._desiredFloorSize = 0;

        for (let child of this.getLayoutChildren()) {
            child.relativePosition = new Point(desiredWidth, 0);
            child.measure(new Size(availableSize.width - desiredWidth, availableSize.height));
            desiredWidth += child.desiredSize.width;
            this._desiredCeilingSize = Math.max(this._desiredCeilingSize, child.desiredCeilingSize);
            this._desiredFloorSize = Math.max(this._desiredFloorSize, child.desiredFloorSize);
        }

        for (let child of this.getLayoutChildren()) {
            child.relativeBaseline = this._desiredCeilingSize;
        }

        const desiredHeight = Style.current.bar.lineHeight * (Defaults.strings - 1)
            + this._desiredCeilingSize
            + this._desiredFloorSize;

        return new Size(desiredWidth, desiredHeight);
    }

    private calculateMinimumBarWidth(finalWidth: number): number {
        const sortedBars = [...this.bars];
        sortedBars.sort((a, b) => a.desiredSize.width - b.desiredSize.width);
        let sumFixedWidth = 0;
        let minimumWidth = 0;
        for (let i = sortedBars.length; i >= 1; ++i) {
            minimumWidth = (finalWidth - sumFixedWidth) / i;
            const potentialFixedWidth = sortedBars[i - 1].desiredSize.width;
            if (potentialFixedWidth <= minimumWidth)
                break;

            sumFixedWidth += potentialFixedWidth;
        }

        return minimumWidth;
    }

    protected arrangeOverride(finalSize: Size): Size {

        this.initializeHeightMaps(finalSize.width);

        const minimumBarWidth = this.calculateMinimumBarWidth(finalSize.width);

        let renderWidth = 0;
        for (let child of this.getLayoutChildren()) {
            let size: Size;
            if (child instanceof Bar) {
                size = new Size(Math.max(child.desiredSize.width, minimumBarWidth), finalSize.height);
            } else {
                size = new Size(child.desiredSize.width, finalSize.height);
            }

            child.relativePosition = new Point(renderWidth, 0);
            child.relativeBaseline = this.desiredCeilingSize;
            child.arrange(Rect.create(this.position.translate(child.relativePosition), size));

            renderWidth += child.renderSize.width;
        }

        return new Size(renderWidth, this.desiredSize.height);
    }

    destroy(): void {
        this.barLines.forEach(l => l.destroy());
    }
}

export module DocumentRow {

    export interface IDecendant {
        readonly ownerRow: DocumentRow;
    }

    export abstract class Child extends WidgetBase implements IDecendant {

        private _desiredCeilingSize: number;
        private _desiredFloorSize: number;

        abstract readonly ownerRow: DocumentRow;

        /** the position relative to owner row */
        relativePosition: Point;

        /** the relative y position of the first (upper-most) bar line */
        relativeBaseline: number;

        get desiredCeilingSize(): number {
            return this._desiredCeilingSize;
        }

        get desiredFloorSize(): number {
            return this._desiredFloorSize;
        }

        protected setDesiredCeilingSize(value: number) {
            this._desiredCeilingSize = value;
        }

        protected setDesiredFloorSize(value: number) {
            this._desiredFloorSize = value;
        }

        /**
         * convert a position relative to this widget to a position relative to the owner row
         */
        getPositionRelativeToOwnerRow(relativePosition: Point): Point {
            return this.relativePosition.translate(relativePosition);
        }


        getXRelativeToOwnerRow(x: number): number {
            return this.relativePosition.x + x;
        }
    }

}