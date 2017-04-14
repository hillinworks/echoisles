import { BeatNote as CoreNote } from "../../Core/Sheet/BeatNote";
import { BarColumn } from "./BarColumn";
import { NoteBase } from "./NoteBase";
import { IChordFingering } from "../../Core/Sheet/Tablature/IChordFingering";
import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import { Size } from "../Size";
import { setPosition, makeStyle, font, align, centerAlign } from "./Utilities";
import { Style } from "../Style";
import {Vector} from "../Vector";

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

    matchesChord(fingering: IChordFingering): boolean {
        return this.note.matchesChord(fingering);
    }

    private initializeComponents() {
        this.frettingText = new fabric.Text(this.note.fret.toString(),
            makeStyle(font(Style.current.note.size), centerAlign(true)));
        this.root!.canvas.add(this.frettingText);
    }

    protected measureOverride(availableSize: Size): Size {
        const margin = Style.current.note.head.margin;
        return Size.fromSizeLike(this.frettingText.getBoundingRect()).inflate(new Size(margin, margin));
    }

    protected arrangeOverride(finalSize: Size): Size {
        const margin = Style.current.note.head.margin;
        setPosition(this.frettingText, this.position);
        return Size.fromSizeLike(this.frettingText.getBoundingRect()).inflate(new Size(margin, margin));
    }
}