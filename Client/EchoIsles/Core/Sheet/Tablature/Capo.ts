import { Element } from "../Element"
import { CapoInfo } from "../../MusicTheory/String/Plucked/CapoInfo";
import { Defaults } from "./Defaults"

export class Capo extends Element {
    capoInfo: CapoInfo;

    offsetFrets(offsets: number[]): number[] {
        if (offsets === undefined)
            offsets = new Array<number>(Defaults.strings);

        if (this.capoInfo.affectedStrings === undefined) {
            for (let i = 0; i < Defaults.strings; ++i)
                offsets[i] = Math.max(offsets[i], this.capoInfo.position);
        } else {
            this.capoInfo.affectedStrings
                .forEach(s => offsets[s - 1] = Math.max(offsets[s - 1], this.capoInfo.position));
        }

        return offsets;
    }
}