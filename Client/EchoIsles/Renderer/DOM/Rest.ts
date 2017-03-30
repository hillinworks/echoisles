import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import { BarColumn } from "./BarColumn";
import { NoteBase } from "./NoteBase";
import { IChordFingering } from "../../Core/Sheet/Tablature/IChordFingering";

export class Rest extends NoteBase {
    constructor(parent: BarColumn, readonly ownerBeat: CoreBeat, readonly string: number) {
        super(parent);
    }

    get isHarmonics(): boolean {
        return false;
    }


    matchesChord(fingering: IChordFingering): boolean {
        return true;
    }
}