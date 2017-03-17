import { WidgetBase } from "../WidgetBase";
import { Bar } from "./Bar";
import { Size } from "../Size";
import { Rect } from "../Rect";
import { BarLine } from "./BarLine";
import { BarLine as CoreBarLine } from "../../Core/MusicTheory/BarLine";

export class DocumentRow extends WidgetBase {

    private readonly bars = new Array<Bar>();
    private readonly barLines = new Array<BarLine>();

    get barCount(): number {
        return this.bars.length;
    }

    addBar(bar: Bar): void {
        if (this.bars.length === 0) {
            this.barLines.push(new BarLine(this, CoreBarLine.merge(undefined, bar.bar.openLine)));
        } else {
            this.barLines.push(new BarLine(this, CoreBarLine.merge(this.bars[this.bars.length - 1].bar.closeLine, bar.bar.openLine)));
        }

        this.bars.push(bar);
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

    private *getLayoutChildren(): IterableIterator<WidgetBase> {
        for (let i = 0; i < this.barLines.length; ++i) {
            yield this.barLines[i];

            if (i !== this.barLines.length - 1) {
                yield this.bars[i];
            }
        }
    }

    protected measureOverride(availableSize: Size): Size {
        let desiredWidth = 0;
        let desiredHeight = 0;


        for (let child of this.getLayoutChildren()) {
            child.measure(new Size(availableSize.width - desiredWidth, availableSize.height));
            desiredWidth += child.desiredSize.width;
            desiredHeight = Math.max(desiredHeight, child.desiredSize.height);
        }

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
        const minimumBarWidth = this.calculateMinimumBarWidth(finalSize.width);

        let renderWidth = 0;
        let renderHeight = 0;
        for (let child of this.getLayoutChildren()) {
            const size = new Size(Math.max(child.desiredSize.width, minimumBarWidth), finalSize.height);
            child.arrange(Rect.create(this.position, size));
            renderWidth += child.renderSize.width;
            renderHeight = Math.max(renderHeight, child.renderSize.height);
        }

        return new Size(renderWidth, renderHeight);
    }

    destroy(): void {
        this.barLines.forEach(l => l.destroy());
    }
}