import { WidgetBase } from "../WidgetBase";
import { Voice } from "./Voice";
import { Bar } from "./Bar";
import { Point } from "../Point";
import { DocumentRow } from "./DocumentRow";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import {IBarRelated} from "./IBarRelated";
import {IVoiceDescendant} from "./IVoiceDescendant";

export class BeamConnector extends WidgetBase implements IBarRelated, IVoiceDescendant {
    barRelatedPosition: Point;

    private from: Point;
    private to: Point;

    constructor(readonly parent: WidgetBase & IVoiceDescendant, readonly noteValue: BaseNoteValue) {
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