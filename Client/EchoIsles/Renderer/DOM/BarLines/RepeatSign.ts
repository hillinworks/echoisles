import { WidgetBase } from "../../WidgetBase";
import { makeStyle, noStroke, fill, radius, setPosition, centerAlign } from "../Utilities";
import { Style } from "../../Style";
import { Size } from "../../Size";
import { Defaults } from "../../../Core/Sheet/Tablature/Defaults";

export class RepeatSign extends WidgetBase {
    private dot1: fabric.Circle;
    private dot2: fabric.Circle;

    constructor(parent: WidgetBase) {
        super(parent);
        this.initializeComponents();
    }

    get dotSpacing(): number {
        if (Defaults.strings % 2 === 0) {
            return Style.current.bar.lineHeight;
        } else {
            return Style.current.bar.lineHeight * 2;
        }
    }

    private createDot(): fabric.Circle {
        const dot = new fabric.Circle(makeStyle(centerAlign(), noStroke(), fill(), radius(Style.current.barLine.repeatDotRadius)));
        if (this.root) {
            this.root.canvas.add(dot);
        }
        return dot;
    }

    private initializeComponents() {
        this.dot1 = this.createDot();
        this.dot2 = this.createDot();
    }

    protected measureOverride(availableSize: Size): Size {
        return new Size(this.dot1.radius! * 2, this.dot1.radius! * 2 + this.dotSpacing);
    }

    protected arrangeOverride(finalSize: Size): Size {
        const y1 = (Math.ceil(Defaults.strings / 2 - 1) - 0.5) * Style.current.bar.lineHeight;
        const y2 = (Math.floor(Defaults.strings / 2 + 1) - 0.5) * Style.current.bar.lineHeight;

        setPosition(this.dot1, this.position.translate({ x: 0, y: y1 }));
        setPosition(this.dot2, this.position.translate({ x: 0, y: y2 }));

        return this.desiredSize;
    }

    destroy(): void {
        if (this.root) {
            this.root.canvas.remove(this.dot1);
            this.root.canvas.remove(this.dot2);
        }
    }
}