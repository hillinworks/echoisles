import { WidgetBase } from "../WidgetBase";
import { Size } from "../Size";
import { Style } from "../Style";
import { setPosition, makeStyle, align, stroke, setSize } from "./Utilities";

export class BarHorizontalLine extends WidgetBase {

    private line: fabric.Line;

    constructor(parent: WidgetBase) {
        super(parent);

        this.initializeComponents();
    }

    private initializeComponents() {
        this.line = new fabric.Line(undefined,
            makeStyle(align("left", "center"), stroke()));

        if (this.root) {
            this.root.canvas.add(this.line);
        }
    }

    protected measureOverride(availableSize: Size): Size {
        return new Size(availableSize.width, Style.current.bar.horizontalLineThickness);
    }

    protected arrangeOverride(finalSize: Size): Size {
        setPosition(this.line, this.position);
        setSize(this.line, { width: finalSize.width, height: 0 });
        return new Size(finalSize.width, Style.current.bar.horizontalLineThickness);
    }

destroy(): void {
    if(this.root) {
        this.root.canvas.remove(this.line);
    }
}
}