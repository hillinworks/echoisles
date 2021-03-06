﻿import { BarColumn as CoreBarColumn } from "../../Core/Sheet/BarColumn";
import { LyricsSegment } from "./LyricsSegment";
import { Note } from "./Note";
import { ChordStrumTechnique } from "./ChordStrumTechnique";
import { LongNoteCapsule } from "./LongNoteCapsule";
import { ChordDiagram } from "./ChordDiagram";
import { L, firstOrUndefined, last, orderBy, any, select, all, allEquals } from "../../Core/Utilities/LinqLite";
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
import { Range } from "../Range";
import { getBarBodyHeight } from "./Utilities";

export class BarColumn extends BarChild {

    /** the bounds to layout only the notes and and their accessories, but not chord diagram or lyrics segment */
    private _relativeNoteElementsBounds: Rect;

    private _lyricsSegment?: LyricsSegment;
    private chordStrumTechnique?: ChordStrumTechnique;
    private _chordDiagram?: ChordDiagram;
    private readonly longNoteCapsules = new Array<LongNoteCapsule>();

    readonly notes = new Array<NoteBase>();

    /** an array representing whether a string has been occupied by a note, maintained by initializeNotes */
    private readonly stringOccupation = new Array<boolean>(Defaults.strings);

    /** an array representing whether a string has been obstructed by a note or a long-note capsule, maintained by initializeNotes */
    private readonly stringObstruction = new Array<boolean>(Defaults.strings);

    /** an array representing the geometric 'holes' made by note or long-note capsule obstructures. only available after arrange */
    private readonly stringHoles = new Array<Range>(Defaults.strings);

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
    }

    private initializeNotes(): void {

        if (this.chordStrumTechnique && this.allNotesMatchChord) {
            return;
        }

        for (let beat of this.barColumn.voiceBeats) {
            for (let note of beat.notesDefiner.notes) {
                this.notes.push(new Note(this, note, beat));
            }
        }


        // create rests
        if (all(this.barColumn.voiceBeats, b => b.isRest) && allEquals(this.barColumn.voiceBeats, b => b.noteValue.base)) {
            // all beats are rests we'll just create one
            this.notes.push(new Rest(this, this.barColumn.voiceBeats[0], Defaults.strings / 2 - 2));
        } else {
            // create individual rests
            this.notes.push(
                ...L(this.barColumn.voiceBeats).where(b => b.isRest)
                    .select(b => {
                        const string = VoicePart.getEpitaxyDirection(b.voicePart) === VerticalDirection.Above
                            ? -1
                            : Defaults.strings - 2;
                        return new Rest(this, b, string);
                    }));
        }

        this.notes.forEach(n => {
            if (n.isObstructure) {
                this.stringOccupation[n.string] = true;
                this.stringObstruction[n.string] = true;
            }
        });

        // create long note capsules
        const notes = orderBy(this.notes, n => n.string);

        let capsuleNotes = new Array<Note>();

        const self = this;
        function addLongNoteCapsule() {
            const capsule = new LongNoteCapsule(self, capsuleNotes);
            self.longNoteCapsules.push(capsule);
            for (let i = capsule.stringRange.min; i <= capsule.stringRange.max; ++i) {
                self.stringObstruction[i] = true;
            }
        }

        for (let note of notes) {
            if (note instanceof Note && note.ownerBeat.noteValue.base >= BaseNoteValue.Half) {
                capsuleNotes.push(note);
                continue;
            }

            if (capsuleNotes.length > 0) {
                addLongNoteCapsule();
                capsuleNotes = new Array<Note>();
            }
        }

        if (capsuleNotes.length > 0) {
            addLongNoteCapsule();
        }
    }

    private initializeChordStrumTechnique() {
        const beat = this.barColumn.voiceBeats.find(b => b.hasChordStrumTechnique);
        if (!beat) {
            return;
        }

        let { min: minString, max: maxString }
            = L(this.notes).where(n => n instanceof Note && !n.isVirtual && !n.note.isTied).minMax(n => n.string);

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

    isStringOccupied(string: number): boolean {
        return this.stringOccupation[string];
    }

    isStringObstructed(string: number): boolean {
        return this.stringObstruction[string];
    }

    getStringHole(string: number): Range {
        return this.stringHoles[string];
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
        // bar column is horizontally center-aligned
        let bounds = Rect.zero;

        for (let note of this.notes) {
            note.measure(availableSize);
            const string = note.string;
            note.relativePosition = new Point(this.getNoteAlternationOffset(string),
                Style.current.bar.lineHeight * string);
            bounds = bounds.union(Rect.createFromCenter(note.relativePosition, note.desiredSize));
        }

        for (let capsule of this.longNoteCapsules) {
            capsule.measure(availableSize);
            capsule.relativePosition = Point.average(select(capsule.notes, n => n.relativePosition));
            bounds = bounds.union(Rect.createFromCenter(capsule.relativePosition, capsule.desiredSize));
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

        // ownerRow could be undefined if this is the pre-measure stage
        if (this.ownerRow) {
            this.updateHeightMaps(bounds);
        }

        return bounds.size;
    }

    private updateHeightMaps(bounds: Rect) {
        const x = this.ownerBar.getXRelativeToOwnerRow(this.relativePosition + bounds.left);

        if (bounds.top < 0) {
            this.ownerRow.getHeightMap(VoicePart.Treble).ensureHeight(x, bounds.width, -bounds.top);
        }

        const floorEpitaxy = bounds.bottom - getBarBodyHeight();
        if (floorEpitaxy > 0) {
            this.ownerRow.getHeightMap(VoicePart.Bass).ensureHeight(x, bounds.width, floorEpitaxy);
        }
    }

    protected arrangeOverride(finalSize: Size): Size {
        let bounds = Rect.create(this.position);

        for (let i = 0; i < Defaults.strings; ++i) {
            this.stringHoles[i] = new Range(this.position.x, this.position.x);
        }

        for (let note of this.notes) {
            note.arrange(Rect.create(this.position.translate(note.relativePosition), note.desiredSize));
            if (note.isObstructure) {
                this.stringHoles[note.string] = this.stringHoles[note.string].union(
                    Range.fromRadius(note.position.x, note.desiredSize.width / 2));
            }
            bounds = bounds.union(Rect.create(note.position, note.renderSize));
        }

        for (let capsule of this.longNoteCapsules) {
            capsule.arrange(Rect.create(this.position.translate(capsule.relativePosition), capsule.desiredSize));
            for (var i = capsule.stringRange.min; i <= capsule.stringRange.max; ++i) {
                this.stringHoles[i] =
                    this.stringHoles[i].union(Range.fromRadius(capsule.position.x, capsule.renderSize.width / 2));
            }
            bounds = bounds.union(Rect.create(capsule.position, capsule.renderSize));
        }

        if (this.chordStrumTechnique) {
            this.chordStrumTechnique.arrange(Rect.create(
                this.position.translate(this.chordStrumTechnique.relativePosition),
                this.chordStrumTechnique.desiredSize));
            bounds = bounds.union(Rect.create(this.chordStrumTechnique.position,
                this.chordStrumTechnique.renderSize));
        }

        this.updateHeightMaps(bounds);

        return bounds.size;
    }

    destroy(): void {
        this.destroyChildren(
            this._lyricsSegment,
            this.chordStrumTechnique,
            this._chordDiagram,
            this.longNoteCapsules,
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