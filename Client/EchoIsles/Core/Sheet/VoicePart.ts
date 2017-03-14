import { VerticalDirection } from "../Style/VerticalDirection";

export enum VoicePart {
    Treble,
    Bass
}

export module VoicePart {

    export function getDefaultTiePosition(voicePart: VoicePart): VerticalDirection {
        switch (voicePart) {
            case VoicePart.Treble:
                return VerticalDirection.Above;
            case VoicePart.Bass:
                return VerticalDirection.Under;
            default:
                throw new RangeError();
        }
    }
}