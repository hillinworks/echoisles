import { WidgetBase } from "../WidgetBase";
import { BarLine } from "../../Core/MusicTheory/BarLine";
import { Bar as CoreBar } from "../../Core/Sheet/Bar";
import { BarColumn } from "./BarColumn";
import { Voice } from "./Voice";
import { Size } from "../Size";
import { PreciseDuration } from "../../Core/MusicTheory/PreciseDuration";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Style } from "../Style";

enum ColumnParallelablity {
    Parallelable,
    ShareVoice,
    NoteConflict
}


function canColumnsBeParallel(a: BarColumn, b: BarColumn): ColumnParallelablity {
    for (let beatOfA of a.barColumn.voiceBeats) {
        for (let beatOfB of b.barColumn.voiceBeats) {

            const heightDifference = VoicePart.compareHeight(beatOfA.voicePart, beatOfB.voicePart);

            if (heightDifference === 0) {   // both have same voice part
                return ColumnParallelablity.ShareVoice;
            } else if (heightDifference > 0) { // beatOfA is in a higher voice part
                if (beatOfA.notes.some(noteOfA => beatOfB.notes
                    .some(noteOfB => noteOfB.string <= noteOfA.string))) {
                    // but beatOfB have some note on a higher or equal string than beatOfA
                    return ColumnParallelablity.NoteConflict;
                }
            } else if (heightDifference < 0) { // beatOfB is in a higher voice part
                if (beatOfA.notes.some(noteOfA => beatOfB.notes
                    .some(noteOfB => noteOfB.string >= noteOfA.string))) {
                    // but beatOfA have some note on a higher or equal string than beatOfB
                    return ColumnParallelablity.NoteConflict;
                }
            }
        }
    }

    return ColumnParallelablity.Parallelable;
}

export class Bar extends WidgetBase {

    private readonly columns = new Array<BarColumn>();
    private readonly columnSpacings = new Array<number>();
    private readonly voices = new Array<Voice>();

    constructor(owner: WidgetBase, public readonly bar: CoreBar) {
        super(owner);
        this.initializeComponents();
    }

    private initializeComponents() {
        this.columns.push(... this.bar.columns.map(c => new BarColumn(this, c)));
        this.voices.push(...[this.bar.bassVoice, this.bar.trebleVoice].map(v => new Voice(this, v)));
    }

    protected measureOverride(availableSize: Size): Size {

        // find the maximum size of the fattest column, and decide desired height by the way
        const columnAvailableSize = new Size(Infinity, availableSize.height);
        let maximumColumnWidth = 0;
        let desiredHeight = 0;
        for (let column of this.columns) {
            column.measure(columnAvailableSize);
            maximumColumnWidth = Math.max(maximumColumnWidth, column.desiredSize.width);
            desiredHeight = Math.max(desiredHeight, column.desiredSize.height);
        }

        // calculate the duration distances between columns, and find out the minimum distance among them
        // the minimum distance MUST be between two columns that share the same voice part, but not 
        // necessarily neightbors
        const distances = new Array<number>(this.columns.length - 1);
        let minDistance = BaseNoteValue.getDuration(this.bar.documentState.time.noteValue).fixedPointValue;

        for (let i = 0; i < distances.length; ++i) {
            const firstColumn = this.columns[i];
            let distanceDetermined = false;
            for (let j = i + 1; j < this.columns.length; ++j) {
                const secondColumn = this.columns[j];
                const parallelability = canColumnsBeParallel(firstColumn, secondColumn);
                if (parallelability !== ColumnParallelablity.Parallelable) {
                    if (!distanceDetermined) {
                        distances[i] = secondColumn.barColumn.position.fixedPointValue -
                            firstColumn.barColumn.position.fixedPointValue;
                        distanceDetermined = true;
                    }

                    if (parallelability === ColumnParallelablity.ShareVoice) {
                        minDistance = Math.min(minDistance, distances[i]);
                        break;
                    }
                }
            }
        }

        // calculate spacings between columns
        const barStyle = Style.current.bar;
        let desiredWidth = maximumColumnWidth * this.columns.length;
        for (let i = 0; i < distances.length; ++i) {
            this.columnSpacings[i] = Math.min(distances[i] / minDistance, barStyle.maxBeatSpacingRatio)
                * barStyle.minBeatSpacing;
            desiredWidth += this.columnSpacings[i];
        }

        return new Size(desiredWidth, desiredHeight);
    }

    protected arrangeOverride(finalSize: Size): Size {
        //todo:last done here
    }

    destroy(): void {
        this.columns.forEach(c => c.destroy());
        this.columnSpacings.length = this.columns.length - 1;
        this.voices.forEach(v => v.destroy());
    }
}