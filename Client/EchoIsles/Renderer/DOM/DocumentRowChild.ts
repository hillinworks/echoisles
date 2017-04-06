import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import {DocumentRow} from "./DocumentRow";
import {IDocumentRowDescendant} from "./IDocumentRowDescendant";

export abstract class DocumentRowChild extends WidgetBase implements IDocumentRowDescendant {

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
