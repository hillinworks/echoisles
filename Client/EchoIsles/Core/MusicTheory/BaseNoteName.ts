export enum BaseNoteName {
    C,
    D,
    E,
    F,
    G,
    A,
    B,
};

export module BaseNoteName {

    export function parse(noteName: string): BaseNoteName | undefined {
        switch (noteName) {
            case "c":
            case "C":
                return BaseNoteName.C;
            case "d":
            case "D":
                return BaseNoteName.D;
            case "e":
            case "E":
                return BaseNoteName.E;
            case "f":
            case "F":
                return BaseNoteName.F;
            case "g":
            case "G":
                return BaseNoteName.G;
            case "a":
            case "A":
                return BaseNoteName.A;
            case "b":
            case "B":
                return BaseNoteName.B;
            default:
                return undefined;
        }
    }

    export function getSemitones(noteName: BaseNoteName): number {
        switch (noteName) {
            case BaseNoteName.C:
                return 0;
            case BaseNoteName.D:
                return 2;
            case BaseNoteName.E:
                return 4;
            case BaseNoteName.F:
                return 5;
            case BaseNoteName.G:
                return 7;
            case BaseNoteName.A:
                return 9;
            case BaseNoteName.B:
                return 11;
            default:
                throw new RangeError("noteName out of range");
        }
    }

    export function getAbsoluteDegrees(noteName: BaseNoteName): number {
        switch (noteName) {
            case BaseNoteName.C:
                return 0;
            case BaseNoteName.D:
                return 1;
            case BaseNoteName.E:
                return 2;
            case BaseNoteName.F:
                return 3;
            case BaseNoteName.G:
                return 4;
            case BaseNoteName.A:
                return 5;
            case BaseNoteName.B:
                return 6;
            default:
                throw "noteName out of range";
        }
    }
}