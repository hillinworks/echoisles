import { StrumTechnique } from "../../Core/MusicTheory/String/Plucked/StrumTechnique";
import { BarColumn } from "./BarColumn";

export class ChordStrumTechnique extends BarColumn.Child {
    constructor(parent: BarColumn, readonly type: StrumTechnique.ChordType, readonly minString: number, readonly maxString: number) {
        super(parent);
    }
}