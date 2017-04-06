import { WidgetBase } from "../WidgetBase";
import { Point } from "../Point";
import { Beam } from "./Beam";
import { Voice } from "./Voice";
import { Bar } from "./Bar";
import { Size } from "../Size";
import { DocumentRow } from "./DocumentRow";
import { BeamContext } from "./BeamContext";
import {IVoiceDescendant} from "./IVoiceDescendant";
import {IBarRelated} from "./IBarRelated";

export abstract class BeatWidgetBase extends WidgetBase implements IVoiceDescendant, IBarRelated {

    /** the root position relative to its owner bar */
    barRelatedPosition: Point;

    context?: BeamContext;

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

    get rootBeam(): Beam | undefined {

        if (this.parent instanceof Beam) {
            if (this.parent.parent instanceof Beam) {
                return this.parent.rootBeam;
            } else {
                return this.parent;
            }
        }

        return undefined;
    }

    abstract get desiredEpitaxySize(): Size;
}

export module BeatWidgetBase {
    export type ParentType = (WidgetBase & IVoiceDescendant) | Voice;
}
