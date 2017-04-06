import { Bar } from "./Bar";
import { IDocumentRowDescendant } from "./IDocumentRowDescendant";

export interface IBarDescendant extends IDocumentRowDescendant {
    readonly ownerBar: Bar;
}