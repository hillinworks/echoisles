import { WidgetBase } from "../WidgetBase";
import { Voice } from "./Voice";
import { Bar } from "./Bar";
import { Point } from "../Point";
import { DocumentRow } from "./DocumentRow";

export class BeamConnector extends WidgetBase implements Voice.IDescendant {

    private from: Point;
    private to: Point;

    constructor(protected readonly parent: WidgetBase & Voice.IDescendant) {
        super(parent);
    }

    get ownerBar(): Bar {
        return this.parent.ownerBar;
    }

    get ownerVoice(): Voice {
        return this.parent.ownerVoice;
    }

    get ownerRow(): DocumentRow {
        return this.parent.ownerRow;
    }

    setTerminals(from: Point, to: Point) {
        this.from = from;
        this.to = to;
    }
}