import { BarBase } from "./BarBase";
import { Size } from "../Size";
import { Rect } from "../Rect";
import { Style } from "../Style";
import { DocumentRow } from "./DocumentRow";

export class EmptyBar extends BarBase {

    constructor(parent: DocumentRow) {
        super(parent);
    }

    protected measureOverride(availableSize: Size): Size {
        return availableSize;
    }

    protected arrangeOverride(finalSize: Size): Size {
        for (let i = 0; i < this.horizontalLines.length; ++i) {
            const horizontalLine = this.horizontalLines[i][0];

            horizontalLine.arrange(new Rect(this.position.x,
                this.position.y + this.relativeBaseline + i * Style.current.bar.lineHeight,
                finalSize.width,
                Style.current.bar.horizontalLineThickness));
        }

        return finalSize;
    }
}