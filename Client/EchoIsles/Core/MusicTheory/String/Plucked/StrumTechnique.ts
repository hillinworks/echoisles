import { BeatModifier } from "../../BeatModifier";

export enum StrumTechnique {
    None = 0,
    BrushDown = 1,
    BrushUp = 2,
    ArpeggioDown = 3,
    ArpeggioUp = 4,
    Rasgueado = 5,
    PickstrokeDown = 6,
    PickstrokeUp = 7
}

export module StrumTechnique {


    export type ChordType = StrumTechnique.None | StrumTechnique.BrushDown | StrumTechnique.BrushUp | StrumTechnique.ArpeggioDown | StrumTechnique.ArpeggioUp | StrumTechnique.Rasgueado;

    export function toStrumTechnique(technique: ChordType): StrumTechnique {
        return technique as StrumTechnique;
    }

    export function isChordType(technique: StrumTechnique): boolean {
        return technique === StrumTechnique.ArpeggioDown
            || technique === StrumTechnique.ArpeggioUp
            || technique === StrumTechnique.BrushDown
            || technique === StrumTechnique.BrushUp
            || technique === StrumTechnique.Rasgueado;
    }

    export function toBeatModifier(technique: StrumTechnique): BeatModifier {
        switch (technique) {
            case StrumTechnique.None:
                return 0;
            case StrumTechnique.PickstrokeDown:
                return BeatModifier.PickstrokeDown;
            case StrumTechnique.PickstrokeUp:
                return BeatModifier.PickstrokeUp;
            case StrumTechnique.Rasgueado:
                return  BeatModifier.Rasgueado;
            default:
                throw new Error("this techinique is not a beat modifier");
        }
    }
}