export enum LeftHandFingerIndex {
    Thumb = 0,
    Index = 1,
    Middle = 2,
    Ring = 3,
    Pinky = 4,
}

export module LeftHandFingerIndex {

    export function toShortString(index: LeftHandFingerIndex) {
        switch (index) {
            case LeftHandFingerIndex.Thumb:
                return "T";
            case LeftHandFingerIndex.Index:
                return "1";
            case LeftHandFingerIndex.Middle:
                return "2";
            case LeftHandFingerIndex.Ring:
                return "3";
            case LeftHandFingerIndex.Pinky:
                return "4";
            default:
                throw new RangeError();
        }
    }

    export function parse(fingerIndexString: string): LeftHandFingerIndex | undefined {
        switch (fingerIndexString) {
            case "t":
            case "T":
                return LeftHandFingerIndex.Thumb;
            case "1":
                return LeftHandFingerIndex.Index;
            case "2":
                return LeftHandFingerIndex.Middle;
            case "3":
                return LeftHandFingerIndex.Ring;
            case "4":
                return LeftHandFingerIndex.Pinky;
            default:
                return undefined;
        }
    }
}