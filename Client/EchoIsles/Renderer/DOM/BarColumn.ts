import { WidgetBase } from "../WidgetBase";
import { BarColumn as CoreBarColumn } from "../../Core/Sheet/BarColumn";
import { LyricsSegment } from "./LyricsSegment";
import { Note } from "./Note";
import { ChordStrumTechnique } from "./ChordStrumTechnique";
import { LongNoteEllipse } from "./LongNoteEllipse";
import { ChordDiagram } from "./ChordDiagram";

export class BarColumn extends WidgetBase {

    /** the width desired to layout only the notes and and their accessories, but not chord diagram or lyrics segment */
    private _compactDesiredWidth: number;

    private _lyricsSegment?: LyricsSegment;
    private chordStrumTechnique?: ChordStrumTechnique;
    private _chordDiagram?: ChordDiagram;
    private readonly longNoteEllipses = new Array<LongNoteEllipse>();
    readonly notes = new Array<Note>();


    /** the relative horizontal position to the owner bar */
    relativePosition: number;

    constructor(parent: WidgetBase, readonly barColumn: CoreBarColumn) {
        super(parent);
        this.initializeComponents();
    }

    get compactDesiredWidth(): number {
        return this._compactDesiredWidth;
    }

    get lyricsSegment(): LyricsSegment | undefined {
        return this._lyricsSegment;
    }

    get chordDiagram(): ChordDiagram {
        return this._chordDiagram;
    }

    private initializeComponents(): void {
        this.initializeNotes();
        this.initializeChordStrumTechnique();
    }

    private initializeNotes(): void {
        for (let beat of this.barColumn.voiceBeats) {
            const beatIsTied = beat.isTied;
            for (let note of beat.notesDefiner.notes) {
                this.notes.push(new Note(this, note, beatIsTied));
            }
        }
    }

    private initializeChordStrumTechnique() {
        if (!this.barColumn.voiceBeats.some(b => b.hasChordStrumTechnique)) {
            return;
        }

        //todo: last done here
    }

    destroy(): void {
        if (this._lyricsSegment) {
            this._lyricsSegment.destroy();
        }

        if (this.chordStrumTechnique) {
            this.chordStrumTechnique.destroy();
        }

        if (this._chordDiagram) {
            this._chordDiagram.destroy();
        }

        this.longNoteEllipses.forEach(e => e.destroy());

        this.notes.forEach(n => n.destroy());
    }


}