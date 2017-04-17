import { TextRange } from "../../Core/Parsing/TextRange";


export abstract class Node {

    range: TextRange;

    constructor(range?: TextRange) {

    }

}