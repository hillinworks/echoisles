export enum RightHandFingerIndex {
    Pulgar = 0,
    Indice = 1,
    Medio = 2,
    Anular = 3,
    Chico = 4
}


export module RightHandFingerIndex {

    export function toShortString(index: RightHandFingerIndex) {
        switch (index) {
            case RightHandFingerIndex.Pulgar:
                return "p";
            case RightHandFingerIndex.Indice:
                return "i";
            case RightHandFingerIndex.Medio:
                return "m";
            case RightHandFingerIndex.Anular:
                return "a";
            case RightHandFingerIndex.Chico:
                return "c";
            default:
                throw new RangeError();
        }
    }
}