import { Size } from "./Size";
import { Point } from "./Point";
import { Rect } from "./Rect";
import { IWidgetRoot } from "./WidgetRoot";

export class WidgetBase {

    private _isLayoutInvalidated: boolean;
    private _position = Point.NaN;
    private _desiredSize = Size.zero;
    private _renderSize = Size.zero;

    private availableSize = Size.zero;
    private finalRect = Rect.zero;

    constructor(protected readonly parent?: WidgetBase) {

    }

    protected get root(): IWidgetRoot | undefined {
        return this.parent ? this.parent.root : undefined;
    }

    protected get isLayoutInvalidated(): boolean {
        return this._isLayoutInvalidated;
    }

    get position(): Point {
        return this._position;
    }

    set position(value: Point) {
        this._position = value;
        this.invalidateLayout();
    }

    get desiredSize(): Size {
        return this._desiredSize;
    }

    get renderSize(): Size {
        return this._renderSize;
    }

    invalidateLayout(): void {
        this._isLayoutInvalidated = true;
        if (this.parent) {
            this.parent.invalidateLayout();
        }
    }

    measure(availableSize: Size): void {
        if (availableSize.equals(this.availableSize) && !this._isLayoutInvalidated) {
            return;
        }

        this.availableSize = availableSize;

        this._desiredSize = this.measureOverride(availableSize);
    }

    arrange(finalRect: Rect): void {

        if (finalRect.equals(this.finalRect) && !this._isLayoutInvalidated) {
            return;
        }

        this.finalRect = finalRect;

        this._position = finalRect.topLeft;
        this._renderSize = this.arrangeOverride(finalRect.size);

        this._isLayoutInvalidated = false;
    }

    protected measureOverride(availableSize: Size): Size {
        return Size.zero;
    }

    protected arrangeOverride(finalSize: Size): Size {
        return finalSize;
    }

    destroy(): void {
    }

    protected destroyChildren(...children: Array<WidgetBase | WidgetBase[] | undefined>): void {
        for (let child of children) {
            if (child) {
                if (child instanceof WidgetBase) {
                    child.destroy();
                    return;
                }

                child.forEach(c => c.destroy());
            }
        }
    }
}