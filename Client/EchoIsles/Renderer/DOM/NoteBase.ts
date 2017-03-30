import { BarColumn } from "./BarColumn";
import { IChordFingering } from "../../Core/Sheet/Tablature/IChordFingering";
import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
export abstract class NoteBase extends BarColumn.Child {
    abstract get isHarmonics(): boolean;
    abstract get string(): number;
    abstract get ownerBeat(): CoreBeat;
    abstract matchesChord(fingering: IChordFingering): boolean;
}