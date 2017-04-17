export enum NoteValueAugment {
    None = 0,
    Dot = 1,
    TwoDots = 2,
    ThreeDots = 3
}

export module NoteValueAugment {

    export function getDurationMultiplier(augment: NoteValueAugment): number {
        switch (augment) {
            case NoteValueAugment.None:
                return 1.0;
            case NoteValueAugment.Dot:
                return 1.5;
            case NoteValueAugment.TwoDots:
                return 1.75;
            case NoteValueAugment.ThreeDots:
                return 1.875;
            default:
                throw new RangeError();
        }
    }
}