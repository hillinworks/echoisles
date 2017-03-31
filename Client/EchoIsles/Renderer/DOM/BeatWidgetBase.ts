import { WidgetBase } from "../WidgetBase";
import { IBeatElement } from "../../Core/Sheet/IBeatElement";
import { Point } from "../Point";
import { Beam as CoreBeam } from "../../Core/Sheet/Beam";
import { Beam } from "./Beam";
import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import { Beat } from "./Beat";
import { Voice } from "./Voice";
import { Bar } from "./Bar";
import { BeamSlope } from "./BeamSlope";
import { Size } from "../Size";
import { DocumentRow } from "./DocumentRow";

export abstract class BeatWidgetBase extends WidgetBase implements Voice.IDescendant {

    /** the root position relative to its owner bar */
    protected protectedRootPosition: Point;

    slope?: BeamSlope;

    protected constructor(protected readonly parent: BeatWidgetBase.ParentType) {
        super(parent);
    }

    get ownerBar(): Bar {
        return this.parent.ownerBar;
    }

    get ownerRow(): DocumentRow {
        return this.ownerBar.ownerRow;
    }

    get ownerVoice(): Voice {
        if (this.parent instanceof Voice) {
            return this.parent;
        } else {
            return this.parent.ownerVoice;
        }
    }

    get rootPosition(): Point {
        return this.protectedRootPosition;
    }

    abstract get desiredEpitaxySize(): Size;
}

export module BeatWidgetBase {
    export type ParentType = (WidgetBase & Voice.IDescendant) | Voice;

    export function create(owner: ParentType, element: IBeatElement): BeatWidgetBase {
        if (element instanceof CoreBeam) {
            return new Beam(owner, element);
        } else if (element instanceof CoreBeat) {
            return new Beat(owner, element);
        } else {
            throw new Error("invalid element");
        }
    }
}