import { IBarVoiceElement } from "./IBarVoiceElement";
import { IBeatElement } from "./IBeatElement";
import { Beat } from "./Beat";
import { PreciseDuration } from "../MusicTheory/PreciseDuration";

export interface IBeatElementContainer extends IBarVoiceElement {
    readonly elements: IBeatElement[];
}

// ReSharper disable once InconsistentNaming
export module IBeatElementContainer {
    export function getFirstBeat(container: IBeatElementContainer): Beat | undefined {
        while (container.elements !== undefined && container.elements.length > 0) {
            const firstElement = container.elements[0];
            if (firstElement instanceof Beat)
                return firstElement as Beat;

            container = firstElement as any as IBeatElementContainer;
        }

        return undefined;
    }

    export function getLastBeat(container: IBeatElementContainer): Beat | undefined {
        while (container.elements !== undefined && container.elements.length > 0) {
            const lastElement = container.elements[container.elements.length - 1];
            if (lastElement instanceof Beat)
                return lastElement;

            container = lastElement as any as IBeatElementContainer;
        }

        return undefined;
    }

    export function getMinimumBeatDuration(container: IBeatElementContainer): PreciseDuration {
        let minFixedDuration = Number.MAX_VALUE;
        for (let element of container.elements) {
            if (element instanceof Beat) {
                minFixedDuration = Math.min(minFixedDuration, element.duration.fixedPointValue);
            } else {
                minFixedDuration = Math.min(minFixedDuration,
                    getMinimumBeatDuration(element as any as IBeatElementContainer).fixedPointValue);
            }
        }

        return new PreciseDuration(minFixedDuration);
    }
}