import { DocumentRow } from "../DocumentRow";
import { DocumentRowChild } from "../DocumentRowChild";
import { makeStyle, align, stroke, setPosition, setSize, getBarBodyHeight } from "../Utilities";
import { Style } from "../../Style";
import { Size } from "../../Size";
import { RepeatSign } from "./RepeatSign";
import { Rect } from "../../Rect";

export abstract class BarLineBase extends DocumentRowChild {

    private readonly lines = new Array<fabric.Object>();
    private readonly repeatSigns = new Array<RepeatSign>();

    protected constructor(readonly ownerRow: DocumentRow) {
        super(ownerRow);
    }

    private createLine(thickness: number): fabric.Line {
        const line = new fabric.Line(undefined,
            makeStyle(align("center", "top"), stroke(undefined, thickness)));

        this.lines.push(line);

        if (this.root) {
            this.root.canvas.add(line);
        }

        return line;
    }

    protected createThinLine(): fabric.Line {
        return this.createLine(Style.current.barLine.thinLineThickness);
    }

    protected createThickLine(): fabric.Line {
        return this.createLine(Style.current.barLine.thickLineThickness);
    }

    protected createRepeatSign(): RepeatSign {
        const repeatSign = new RepeatSign(this);
        this.repeatSigns.push(repeatSign);
        return repeatSign;
    }

    protected measureOverride(availableSize: Size): Size {
        return new Size(this.measureElementsWidth(availableSize), getBarBodyHeight());
    }

    protected abstract measureElementsWidth(availableSize: Size): number;

    protected arrangeLine(line: fabric.Line, x: number, finalSize: Size) {
        setPosition(line, this.position.translate({ x: x + line.strokeWidth / 2, y: this.relativeBaseline }));
        setSize(line, { width: 0, height: finalSize.height });
    }

    protected arrangeRepeatSign(repeatSign: RepeatSign, x: number) {
        repeatSign.arrange(Rect.create(this.position.translate({ x: x + repeatSign.desiredSize.width / 2, y: this.relativeBaseline }), repeatSign.desiredSize));
    }

    destroy(): void {
        if (this.root) {
            this.root.canvas.remove(...this.lines);
        }

        this.destroyChildren(this.repeatSigns);
    }
}