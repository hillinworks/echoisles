import { IChordFingering } from "../../Core/Sheet/Tablature/IChordFingering";
import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import {BarColumnChild} from "./BarColumnChild";

export abstract class NoteBase extends BarColumnChild {
    abstract get isHarmonics(): boolean;
    abstract get string(): number;
    abstract get ownerBeat(): CoreBeat;
    abstract matchesChord(fingering: IChordFingering): boolean;
}