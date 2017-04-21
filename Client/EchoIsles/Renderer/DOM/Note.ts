import { BeatNote as CoreNote } from "../../Core/Sheet/BeatNote";
import { BarColumn } from "./BarColumn";
import { NoteBase } from "./NoteBase";
import { IChordFingering } from "../../Core/Sheet/Tablature/IChordFingering";
import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import { makeStyle, font, centerAlign } from "./Utilities";
import { Style } from "../Style";

export class Note extends NoteBase {

    private frettingText: fabric.Text;

    constructor(parent: BarColumn, readonly note: CoreNote, readonly ownerBeat: CoreBeat) {
        super(parent);
        this.initializeComponents();
    }

    get isHarmonics(): boolean {
        return this.note.isHarmonics;
    }

    get string(): number {
        return this.note.string;
    }

    get isVirtual(): boolean {
        return this.ownerBeat.isTied;
    }

    get isObstructure(): boolean {
        return true;
    }

    protected get symbolObject(): fabric.Object {
        return this.frettingText;
    }

    matchesChord(fingering: IChordFingering): boolean {
        return this.note.matchesChord(fingering);
    }

    private initializeComponents() {
        this.frettingText = new fabric.Text(this.note.fret.toString(),
            makeStyle(font(Style.current.note.size), centerAlign(true)));

        if (this.root) {
            this.root.canvas.add(this.frettingText);
        }
    }

    destroy(): void {
        if (this.root) {
            this.root.canvas.remove(this.frettingText);
        }
    }
}