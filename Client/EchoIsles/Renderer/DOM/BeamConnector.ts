import { WidgetBase } from "../WidgetBase";
import { Voice } from "./Voice";
import { Beam } from "./Beam";
import { Bar } from "./Bar";
import {Point} from "../Point";

export class BeamConnector extends WidgetBase implements Voice.IDescendant {

    private from: Point;
    private to: Point;

    constructor(protected readonly parent: Beam) {
        super(parent);
    }

    get ownerBar(): Bar {
        return this.parent.ownerBar;
    }

    get ownerVoice(): Voice {
        return this.parent.ownerVoice;
    }

    setTerminals(from: Point, to: Point) {
        this.from = from;
        this.to = to;
    }
}