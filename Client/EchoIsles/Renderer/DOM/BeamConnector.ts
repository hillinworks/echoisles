import { WidgetBase } from "../WidgetBase";
import { Voice } from "./Voice";
import { Bar } from "./Bar";
import { Point } from "../Point";
import { DocumentRow } from "./DocumentRow";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";

export class BeamConnector extends WidgetBase implements Bar.IBarRelated, Voice.IDescendant {
    barRelatedPosition: Point;

    private from: Point;
    private to: Point;

    constructor(readonly parent: WidgetBase & Voice.IDescendant, readonly noteValue: BaseNoteValue) {
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