import { VerticalDirection } from "../Style/VerticalDirection";

export enum VoicePart {
    Treble,
    Bass
}

export module VoicePart {

    export function getEpitaxyPosition(voicePart: VoicePart): VerticalDirection {
        switch (voicePart) {
            case VoicePart.Treble:
                return VerticalDirection.Above;
            case VoicePart.Bass:
                return VerticalDirection.Under;
            default:
                throw new RangeError();
        }
    }

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

    /**
     * compares two VoiceParts, return positive if the first one is generally higher
     * in pitch (and often drawn on the upper side of score)
     */
    export function compareHeight(a: VoicePart, b: VoicePart): number {
        return (b as number) - (a as number);
    }
}