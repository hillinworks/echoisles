import { Beam } from "./Beam";
import { BeamSlope } from "./BeamSlope";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Style } from "../Style";

export class BeamContext {

    constructor(readonly rootBeam: Beam, readonly slope: BeamSlope) {

    }

    getBeatTipPosition(x: number, noteValue: BaseNoteValue): number {
        const y = this.slope.getY(x);
        const offset = (this.rootBeam.beam.beatNoteValue - noteValue)
            * (Style.current.beam.connectorThickness + Style.current.beam.connectorSpacing);

        return y + this.rootBeam.ownerVoice.transformEpitaxy(offset);
    }

    getBeamConnectorPosition(x: number, noteValue: BaseNoteValue): number {
        return this.getBeatTipPosition(x, noteValue);
    }

    getOuterPosition(x: number): number {
        return this.slope.getY(x
            + this.rootBeam.ownerVoice.transformEpitaxy(Style.current.beam.minimumVerticalPadding));
    }
}