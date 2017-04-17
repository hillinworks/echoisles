import { IBeatElement } from "./IBeatElement";
import { IBeatElementContainer } from "./IBeatElementContainer";

export interface IInternalBeatElement extends IBeatElement {
    setOwner(owner: IBeatElementContainer): void;
    clone(): IInternalBeatElement;
}