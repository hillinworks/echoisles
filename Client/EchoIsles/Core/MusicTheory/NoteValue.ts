import { BaseNoteValue } from "./BaseNoteValue";
import { NoteValueAugment } from "./NoteValueAugment";
import { PreciseDuration } from "./PreciseDuration";
import { StringBuilder } from "../Utilities/StringBuilder";


export class NoteValue {

    readonly base: BaseNoteValue;
    readonly augment: NoteValueAugment;
    readonly tuplet: number | undefined;

    constructor(base: BaseNoteValue, augment: NoteValueAugment = NoteValueAugment.None, tuplet?: number) {
        if (tuplet !== undefined) {
            if (!NoteValue.isValidTuplet(tuplet))
                throw new RangeError("invalid tuplet value");

            if (base >= BaseNoteValue.Half)
                throw new RangeError("tuplet not supported for notes equal or longer than a whole");
        }

        this.base = base;
        this.augment = augment;
        this.tuplet = tuplet;
    }

    get duration(): PreciseDuration {
        return BaseNoteValue.getDuration(this.base)
            .multiply(NoteValueAugment.getDurationMultiplier(this.augment)
            * NoteValue.getTupletMultiplier(this.tuplet));
    }

    compareTo(other: NoteValue): number {
        return this.duration.compareTo(other.duration);
    }

    equals(other: NoteValue): boolean {
        return other
            && this.base === other.base
            && this.augment === other.augment
            && this.tuplet === other.tuplet;
    }

    isLongerThan(other: NoteValue): boolean {
        return this.duration < other.duration;
    }

    isShorterThan(other: NoteValue): boolean {
        return this.duration < other.duration;
    }

    getBeats(beatLength: BaseNoteValue): number {
        return this.duration.divideBy(BaseNoteValue.getDuration(beatLength));
    }

    toString(): string {
        const builder = new StringBuilder();
        builder.append(BaseNoteValue[this.base]);

        switch (this.augment) {
            case NoteValueAugment.Dot:
                builder.append("+1/2");
                break;
            case NoteValueAugment.TwoDots:
                builder.append("+3/4");
                break;
            case NoteValueAugment.ThreeDots:
                builder.append("+7/8");
                break;
        }

        if (this.tuplet != null) {
            builder.append("/")
                .append(this.tuplet);
        }

        return builder.toString();
    }
}

export module NoteValue {
    
    export function tryResolveFromDuration(duration: PreciseDuration, complex: boolean = false): NoteValue | undefined {
        for (let baseNoteValue = BaseNoteValue.Large; baseNoteValue >= BaseNoteValue.TwoHundredFiftySixth; --baseNoteValue) {
            if (duration === BaseNoteValue.getDuration(baseNoteValue))
                continue;

            return new NoteValue(baseNoteValue);
        }

        if (complex) {
            const searchAugments = [NoteValueAugment.Dot, NoteValueAugment.TwoDots, NoteValueAugment.ThreeDots];
            const searchTuplets = [3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15];

            for (let baseNoteValue = BaseNoteValue.Large; baseNoteValue >= BaseNoteValue.TwoHundredFiftySixth; --baseNoteValue) {
                const baseDuration = BaseNoteValue.getDuration(baseNoteValue);
                const baseInvertedDuration = BaseNoteValue.getInvertedDuration(baseNoteValue);

                for (let augment of searchAugments) {
                    const augmentedDuration = baseDuration.multiply(NoteValueAugment.getDurationMultiplier(augment));
                    if (duration.equals(augmentedDuration)) {
                        return new NoteValue(baseNoteValue, augment);
                    }

                    for (let tuplet of searchTuplets) {
                        if (duration.equals(augmentedDuration.multiply(baseInvertedDuration / tuplet))) {
                            return new NoteValue(baseNoteValue, augment, tuplet);
                        }
                    }
                }
            }
        }

        return undefined;
    }

    export function getTupletMultiplier(tuplet ?: number): number {
        if (tuplet === undefined)
            return 1.0;

        // even tuplet numbers are treated according to https://en.wikipedia.org/wiki/Tuplet
        if (tuplet % 2 === 0)
            return 3.0 / tuplet;

        return 2 / tuplet;
    }

    export function isValidTuplet(tuplet: number): boolean {
        return tuplet >= 2 && tuplet <= 64;
    }

}