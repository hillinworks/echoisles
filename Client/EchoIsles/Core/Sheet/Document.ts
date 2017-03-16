import { Element } from "./Element"
import { Bar } from "./Bar";
import { DocumentState } from "./DocumentState";

export class Document extends Element {

    bars: Bar[];
    documentState: DocumentState;

}