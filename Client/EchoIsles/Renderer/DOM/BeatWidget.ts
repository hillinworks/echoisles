import { BeatWidgetBase } from "./BeatWidgetBase";
import { IBeatElement } from "../../Core/Sheet/IBeatElement";
import { Beam as CoreBeam } from "../../Core/Sheet/Beam";
import { Beam } from "./Beam";
import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import { Beat } from "./Beat";

export module BeatWidget {

    export function create(owner: BeatWidgetBase.ParentType, element: IBeatElement): BeatWidgetBase {
        if (element instanceof CoreBeam) {
            return new Beam(owner, element);
        } else if (element instanceof CoreBeat) {
            return new Beat(owner, element);
        } else {
            throw new Error("invalid element");
        }
    }
}
