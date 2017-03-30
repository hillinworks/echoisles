import { BeatNote as CoreNote } from "../../Core/Sheet/BeatNote";
import { BarColumn } from "./BarColumn";
import { NoteBase } from "./NoteBase";
import { IChordFingering } from "../../Core/Sheet/Tablature/IChordFingering";
import { Beat as CoreBeat } from "../../Core/Sheet/Beat";

export class Note extends NoteBase {
    constructor(parent: BarColumn, readonly note: CoreNote, readonly isVirtual: boolean) {
        super(parent);
    }

    get isHarmonics(): boolean {
        return this.note.isHarmonics;
    }

    get string(): number {
        return this.note.string;
    }

    get ownerBeat(): CoreBeat {
        return this.note.ownerBeat;
    }

    matchesChord(fingering: IChordFingering): boolean {
        return this.note.matchesChord(fingering);
    }
}