import { WidgetBase } from "../WidgetBase";

export class DocumentRowElement extends WidgetBase {

    private _desiredCeilingSize: number;
    private _desiredFloorSize: number;

    /** the relative y position of the first (upper-most) bar line */
    baseline: number;

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
}