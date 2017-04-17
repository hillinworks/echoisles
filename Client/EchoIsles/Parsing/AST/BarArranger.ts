import { DocumentContext } from "../DocumentContext";
import { Bar } from "../../Core/Sheet/Bar";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { Beat } from "../../Core/Sheet/Beat";
import { RhythmSegmentVoice } from "../../Core/Sheet/RhythmSegmentVoice";
import { BeatArranger } from "./BeatArranger";
import { Voice } from "../../Core/Sheet/Voice";
import { PreciseDuration } from "../../Core/MusicTheory/PreciseDuration";
import { BarColumn } from "../../Core/Sheet/BarColumn";

export class BarArranger {
    private readonly context: DocumentContext;
    private readonly bar: Bar;
    private previousTrebleBeat: Beat;
    private previousBassBeat: Beat;

    constructor(context: DocumentContext, bar: Bar) {
        this.context = context;
        this.bar = bar;
    }

    arrange(): void {
        if (this.bar.rhythm !== undefined)
            this.bar.duration = this.bar.rhythm.duration;
        else
            this.bar.duration = this.context.documentState.time.duration;

        this.arrangeBeatsAndNotes();
        this.arrangeColumns();
        this.arrangeVoices();
    }

    private arrangeBeatsAndNotes(): void {
        for (let segment of this.bar.rhythm!.segments) {
            if (segment.bassVoice !== undefined) {
                this.arrangeBeatsAndNotesFor(segment.bassVoice);
            }

            if (segment.trebleVoice !== undefined) {
                this.arrangeBeatsAndNotesFor(segment.trebleVoice);
            }
        }
    }

    private arrangeBeatsAndNotesFor(voice: RhythmSegmentVoice): void {
        for (let beat of voice.beats) {
            const previousBeat = voice.part === VoicePart.Bass ? this.previousBassBeat : this.previousTrebleBeat;
            if (previousBeat) {
                previousBeat.nextBeat = beat;
                beat.previousBeat = previousBeat;
            }
            if (voice.part === VoicePart.Bass) {
                this.previousBassBeat = beat;
            } else {
                this.previousTrebleBeat = beat;
            }
        }
    }

    private arrangeColumns(): void {
        let lyricsSegmentIndex = 0;

        for (let segment of this.bar.rhythm!.segments) {
            if (segment.isOmittedByTemplate)
                continue;

            const beats = new Array<Beat>();

            this.createArrangedBarBeats(beats, segment.trebleVoice);
            this.createArrangedBarBeats(beats, segment.bassVoice);

            type GroupType = { key: PreciseDuration, values: Beat[] };

            const groupMap: { [key: number]: GroupType } = {};
            const groups: GroupType[] = [];

            for (let beat of beats) {
                const position = beat.position.fixedPointValue;
                let group = groupMap[position];
                if (!group) {
                    group = {
                        key: beat.position,
                        values: [beat]
                    };
                    groupMap[position] = group;
                    groups.push(group);
                } else {
                    group.values.push(beat);
                }
            }

            groups.sort(PreciseDuration.createComparer<GroupType>(g => g.key));

            let isFirstBeat = true;
            let currentPosition = PreciseDuration.zero;
            for (let group of groups) {

                const columnIndex = this.bar.columns.length;
                const column = new BarColumn(this.bar, columnIndex, group.key.minus(currentPosition));
                currentPosition = group.key;

                for (let beat of group.values) {
                    beat.ownerColumn = column;
                    column.voiceBeats.push(beat);
                }

                column.chord = segment.chord;

                if (isFirstBeat) {
                    column.isFirstOfSegment = true;
                    isFirstBeat = false;
                }

                this.bar.columns.push(column);
            }

            // fill in lyrics
            if (segment.trebleVoice
                && this.bar.lyrics
                && lyricsSegmentIndex < this.bar.lyrics.segments.length) {
                for (let beat of segment.trebleVoice.beats) {
                    if (lyricsSegmentIndex >= this.bar.lyrics.segments.length) {
                        break;
                    }

                    beat.ownerColumn.lyrics = this.bar.lyrics.segments[lyricsSegmentIndex];
                    ++lyricsSegmentIndex;
                }
            }
        }
    }

    private createArrangedBarBeats(beats: Beat[], voice: RhythmSegmentVoice | undefined): void {
        if (!voice || voice.beats.length === 0)
            return; // todo: insert rest?

        let position = PreciseDuration.zero;

        for (let beat of voice.beats) {
            beat.position = position;
            beats.push(beat);

            position = position.add(beat.duration);
        }
    }

    private arrangeVoices(): void {

        this.bar.bassVoice = new Voice(this.bar, VoicePart.Bass);
        this.bar.trebleVoice = new Voice(this.bar, VoicePart.Treble);

        const bassBeatArranger = new BeatArranger(this.context.documentState.time.noteValue, this.bar.bassVoice);
        const trebleBeatArranger = new BeatArranger(this.context.documentState.time.noteValue, this.bar.trebleVoice);

        for (let segment of this.bar.rhythm!.segments) {
            if (segment.isOmittedByTemplate)
                continue;

            this.appendAndArrangeVoice(segment.bassVoice, bassBeatArranger);
            this.appendAndArrangeVoice(segment.trebleVoice, trebleBeatArranger);
        }

        bassBeatArranger.finish();
        trebleBeatArranger.finish();
    }

    private appendAndArrangeVoice(voice: RhythmSegmentVoice | undefined, beatArranger: BeatArranger): void {
        if (!voice)
            return;

        for (let beat of voice.beats) {
            beatArranger.addBeat(beat);
        }

        const barVoice = this.bar.getVoice(voice.part);
        voice.lastNoteOnStrings.forEach((n, i) => barVoice.lastNoteOnStrings[i] = n);
        barVoice.isTerminatedWithRest = voice.isTerminatedWithRest;
    }


}
