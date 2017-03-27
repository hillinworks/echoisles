import { WidgetBase } from "../WidgetBase";
import { BarColumn as CoreBarColumn } from "../../Core/Sheet/BarColumn";
import { LyricsSegment } from "./LyricsSegment";
import { Note } from "./Note";
import { ChordStrumTechnique } from "./ChordStrumTechnique";
import { LongNoteEllipse } from "./LongNoteEllipse";
import { ChordDiagram } from "./ChordDiagram";
import { minMax } from "../../Core/Utilities/LinqLite";

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

    get chordDiagram(): ChordDiagram | undefined {
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
        const beat = this.barColumn.voiceBeats.find(b => b.hasChordStrumTechnique);
        if (!beat) {
            return;
        }

        let { minString, maxString } = minMax(this.notes);

        for (let note of this.notes) {
            if (note.isVirtual || note.note.isTied) {
                continue;
            }

            minString = Math.min(minString, note.note.string);
            maxString = Math.max(maxString, note.note.string);
        }

        //todo: last done here
    }

    destroy(): void {
        this.destroyChildren(
            this._lyricsSegment,
            this.chordStrumTechnique,
            this._chordDiagram,
            this.longNoteEllipses,
            this.notes);
    }


}