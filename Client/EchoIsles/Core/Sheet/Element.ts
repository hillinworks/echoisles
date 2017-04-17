import { ElementBase } from "./ElementBase";
import { TextRange } from "../Parsing/TextRange";

export abstract class Element extends ElementBase {
    range?: TextRange;
}