import { BarColumn as CoreBarColumn } from "../../Core/Sheet/BarColumn";
import { LyricsSegment } from "./LyricsSegment";
import { Note } from "./Note";
import { ChordStrumTechnique } from "./ChordStrumTechnique";
import { LongNoteEllipse } from "./LongNoteEllipse";
import { ChordDiagram } from "./ChordDiagram";
import { L, firstOrUndefined, last, orderBy, any, select, all } from "../../Core/Utilities/LinqLite";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { IChordDefinition } from "../../Core/Sheet/Tablature/IChordDefinition";
import { Chord } from "../../Core/Sheet/Tablature/Chord";
import { Defaults } from "../../Core/Sheet/Tablature/Defaults";
import { StrumTechnique } from "../../Core/MusicTheory/String/Plucked/StrumTechnique";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Size } from "../Size";
import { Style } from "../Style";
import { Rect } from "../Rect";
import { Point } from "../Point";
import { Bar } from "./Bar";
import { WidgetBase } from "../WidgetBase";
import { NoteBase } from "./NoteBase";
import { Rest } from "./Rest";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { DocumentRow } from "./DocumentRow";
import { BarChild } from "./BarChild";
import { IBarDescendant } from "./IBarDescendant";

export class BarColumn extends BarChild {

    /** the bounds to layout only the notes and and their accessories, but not chord diagram or lyrics segment */
    private _relativeNoteElementsBounds: Rect;

    private _lyricsSegment?: LyricsSegment;
    private chordStrumTechnique?: ChordStrumTechnique;
    private _chordDiagram?: ChordDiagram;
    private readonly longNoteEllipses = new Array<LongNoteEllipse>();
    readonly notes = new Array<NoteBase>();

    /** an array representing whether a string has been occupied by a note, maintained by initializeNotes */
    private readonly stringOccupation = new Array<boolean>(Defaults.strings);

    /** the relative horizontal position to the owner bar */
    relativePosition: number;

    constructor(parent: Bar, readonly barColumn: CoreBarColumn) {
        super(parent);
        this.initializeComponents();
    }

    private get hasHarmonics(): boolean {
        return any(this.notes, n => n.isHarmonics);
    }

    get relativeNoteElementsBounds(): Rect {
        return this._relativeNoteElementsBounds;
    }

    get lyricsSegment(): LyricsSegment | undefined {
        return this._lyricsSegment;
    }

    get chordDiagram(): ChordDiagram | undefined {
        return this._chordDiagram;
    }

    get chord(): IChordDefinition | undefined {
        if (!this.barColumn.chord) {
            return undefined;
        }

        return (this.barColumn.ownerBar.documentState as TablatureState).resolveChord(this.barColumn.chord!);
    }

    get allNotesMatchChord(): boolean {
        const chord = this.chord;
        if (!chord) {
            return false;
        }

        return all(this.notes, n => n.matchesChord(chord.fingering));
    }

    private initializeComponents(): void {
        this.initializeChordStrumTechnique();
        this.initializeNotes();
        this.initializeChordDiagram();
        this.initializeLyricsSegment();
    }

    private initializeNotes(): void {

        if (this.chordStrumTechnique && this.allNotesMatchChord) {
            return;
        }
        const beatsSequence = L(this.barColumn.voiceBeats);
        this.notes.push(
            ...beatsSequence
                .selectMany(b => b.notesDefiner.notes)
                .select(n => new Note(this, n, n.ownerBeat.isTied)));

        // create rests
        if (all(this.barColumn.voiceBeats, b => b.isRest)) {    // all beats are rests we'll just create one
            this.notes.push(new Rest(this, this.barColumn.voiceBeats[0], Defaults.strings / 2));
        } else { // create individual rests
            this.notes.push(
                ...beatsSequence.where(b => b.isRest)
                    .select(b => {
                        const string = VoicePart.getEpitaxyDirection(b.voicePart) === VerticalDirection.Above
                            ? 0
                            : Defaults.strings;
                        return new Rest(this, b, string);
                    }));
        }

        this.notes.forEach(n => this.stringOccupation[n.string] = true);

        // create long note ellipses
        const notes = orderBy(this.notes, n => n.string);

        let ellipseNotes = new Array<Note>();

        for (let note of notes) {
            if (note instanceof Note && note.ownerBeat.noteValue.base >= BaseNoteValue.Half) {
                ellipseNotes.push(note);
                continue;
            }

            if (ellipseNotes.length > 0) {
                this.longNoteEllipses.push(new LongNoteEllipse(this, ellipseNotes));
                ellipseNotes = new Array<Note>();
            }
        }

        if (ellipseNotes.length > 0) {
            this.longNoteEllipses.push(new LongNoteEllipse(this, ellipseNotes));
        }
    }

    private initializeChordStrumTechnique() {
        const beat = this.barColumn.voiceBeats.find(b => b.hasChordStrumTechnique);
        if (!beat) {
            return;
        }

        let { min: minString, max: maxString } = L(this.notes).where(n => n instanceof Note && !n.isVirtual && !n.note.isTied).minMax(n => n.string);

        if (minString === Number.MAX_VALUE || maxString === Number.MIN_VALUE) {
            let chord: IChordDefinition | undefined = undefined;
            if (this.barColumn.chord) {
                chord = (this.barColumn.ownerBar.documentState as TablatureState).resolveChord(this.barColumn.chord!);
            }

            if (chord) {
                const notes = chord.fingering.notes;
                const noteOfFirstString = firstOrUndefined(notes,
                    n => n.fret !== Chord.fingeringSkipString);

                if (noteOfFirstString) {
                    const noteOfLastString =
                        last(notes, n => n.fret !== Chord.fingeringSkipString);

                    // string index here is inverted
                    minString = Defaults.strings - notes.indexOf(noteOfLastString) - 1;
                    maxString = Defaults.strings - notes.indexOf(noteOfFirstString) - 1;
                }
            }
        }

        if (minString === Number.MAX_VALUE || maxString === Number.MIN_VALUE) {
            return;
        }

        this.chordStrumTechnique = new ChordStrumTechnique(this, beat.strumTechnique as StrumTechnique.ChordType, minString, maxString);

        if (beat.isTied) {
            // todo: draw tie
        }
    }

    private initializeChordDiagram() {
        const chord = this.chord;
        if (!chord) {
            return;
        }

        this._chordDiagram = new ChordDiagram(this, chord);
    }

    private initializeLyricsSegment() {
        if (!this.barColumn.lyrics) {
            return;
        }

        this._lyricsSegment = new LyricsSegment(this, this.barColumn.lyrics!);
    }

    private getNoteAlternationOffsetRatio(stringIndex: number): number {
        if (stringIndex === 0) {
            return this.stringOccupation[1] ? -0.25 : 0;
        }

        let continuousStringsBefore = 0;
        for (let i = stringIndex - 1; i >= 0; --i) {
            if (this.stringOccupation[i])
                ++continuousStringsBefore;
            else
                break;
        }

        if (continuousStringsBefore === 0) {
            if (stringIndex === Defaults.strings - 1)
                return 0;

            if (this.stringOccupation[stringIndex + 1])
                return -0.25;

            return 0;
        }

        return (continuousStringsBefore % 2 - 0.5) / 2;
    }

    private getNoteAlternationOffset(stringIndex: number): number {
        return (this.hasHarmonics
            ? Style.current.note.head.alternationOffsetWithHarmonics
            : Style.current.note.head.alternationOffset)
            * this.getNoteAlternationOffsetRatio(stringIndex);
    }

    protected measureOverride(availableSize: Size): Size {
        let bounds = Rect.zero;

        for (let note of this.notes) {
            note.measure(availableSize);
            const desiredSize = note.desiredSize;
            const string = note.string;
            note.relativePosition = new Point(this.getNoteAlternationOffset(string) - desiredSize.width / 2,
                Style.current.bar.lineHeight * string - desiredSize.height / 2);
            bounds = bounds.union(Rect.create(note.relativePosition, note.desiredSize));
        }

        for (let ellipse of this.longNoteEllipses) {
            ellipse.measure(availableSize);
            ellipse.relativePosition = Point.average(select(ellipse.notes, n => n.relativePosition));
            bounds = bounds.union(Rect.create(ellipse.relativePosition, ellipse.desiredSize));
        }

        if (this.chordStrumTechnique) {
            this.chordStrumTechnique.measure(availableSize);
            const y = Style.current.bar.lineHeight
                * (this.chordStrumTechnique.maxString + this.chordStrumTechnique.minString) / 2;
            this.chordStrumTechnique.relativePosition = new Point(bounds.right, y);
            bounds = bounds.union(Rect.create(this.chordStrumTechnique.relativePosition,
                this.chordStrumTechnique.desiredSize));
        }

        this._relativeNoteElementsBounds = bounds;

        if (this.chordDiagram) {
            this.chordDiagram.measure(availableSize);
            const position = new Point(-Style.current.bar.ceilingSpacing - this.chordDiagram.desiredSize.height, 0);
            bounds = bounds.union(Rect.create(position, this.chordDiagram.desiredSize));
        }

        if (this.lyricsSegment) {
            this.lyricsSegment.measure(availableSize);
            const position = new Point(Style.current.bar.floorSpacing + this.lyricsSegment.desiredSize.height, 0);
            bounds = bounds.union(Rect.create(position, this.lyricsSegment.desiredSize));
        }

        return bounds.size;
    }

    protected arrangeOverride(finalSize: Size): Size {
        let bounds = Rect.create(this.position);

        for (let note of this.notes) {
            note.arrange(Rect.create(this.position.translate(note.relativePosition), note.desiredSize));
            bounds = bounds.union(Rect.create(note.position, note.renderSize));
        }

        for (let ellipse of this.longNoteEllipses) {
            ellipse.arrange(Rect.create(this.position.translate(ellipse.relativePosition), ellipse.desiredSize));
            bounds = bounds.union(Rect.create(ellipse.position, ellipse.renderSize));
        }

        if (this.chordStrumTechnique) {
            this.chordStrumTechnique.arrange(Rect.create(
                this.position.translate(this.chordStrumTechnique.relativePosition),
                this.chordStrumTechnique.desiredSize));
            bounds = bounds.union(Rect.create(this.chordStrumTechnique.position,
                this.chordStrumTechnique.renderSize));
        }

        if (this.chordDiagram) {
            const position = new Point(-Style.current.bar.ceilingSpacing - this.chordDiagram.desiredSize.height, 0);
            this.chordDiagram.arrange(Rect.create(this.position.translate(position), this.chordDiagram.desiredSize));
            bounds = bounds.union(Rect.create(this.chordDiagram.position, this.chordDiagram.renderSize));
        }

        if (this.lyricsSegment) {
            const position = new Point(Style.current.bar.floorSpacing + this.lyricsSegment.desiredSize.height, 0);
            this.lyricsSegment.arrange(Rect.create(this.position.translate(position), this.lyricsSegment.desiredSize));
            bounds = bounds.union(Rect.create(this.lyricsSegment.position, this.lyricsSegment.renderSize));
        }

        return bounds.size;
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

export module BarColumn {

    export abstract class Child extends WidgetBase implements IBarDescendant {

        /** the position relative to the baseline of owner bar column */
        relativePosition: Point;

        protected constructor(readonly ownerBarColumn: BarColumn) {
            super(ownerBarColumn);
        }

        get ownerBar(): Bar {
            return this.ownerBarColumn.ownerBar;
        }

        get ownerRow(): DocumentRow {
            return this.ownerBar.ownerRow;
        }
    }

}