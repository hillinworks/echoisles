import { StrumTechnique } from "../../Core/MusicTheory/String/Plucked/StrumTechnique";
import { BarColumn } from "./BarColumn";
import {BarColumnChild} from "./BarColumnChild";

export class ChordStrumTechnique extends BarColumnChild {
    constructor(parent: BarColumn, readonly type: StrumTechnique.ChordType, readonly minString: number, readonly maxString: number) {
        super(parent);
    }
}