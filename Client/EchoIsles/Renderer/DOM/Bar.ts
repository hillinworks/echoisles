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
import { IBeatElementContainer } from "../../Core/Sheet/IBeatElementContainer";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { Defaults } from "../../Core/Sheet/Tablature/Defaults";
import { DocumentRowElement } from "./DocumentRowElement";
import { Vector } from "../Vector";
import { Rect } from "../Rect";

export class Bar extends DocumentRowElement {

    readonly columns = new Array<BarColumn>();
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

        // measure all columns first
        const columnAvailableSize = new Size(Infinity, availableSize.height);
        for (let column of this.columns) {
            column.measure(columnAvailableSize);
        }

        // decide column locations and measure desired width
        const barStyle = Style.current.bar;

        let desiredWidth = 0;

        if (this.columns.length > 0) {
            const spacingToDuration = barStyle.minBeatSpacing / this.bar.minimumBeatDuration.fixedPointValue;

            const firstColumn = this.columns[0];
            firstColumn.relativePosition = 0;
            let x = firstColumn.compactDesiredWidth;
            let lastLyricsStop = firstColumn.lyricsSegment ? firstColumn.lyricsSegment.desiredSize.width : 0;
            let lastChordStop = firstColumn.chordDiagram ? firstColumn.chordDiagram.desiredSize.width : 0;

            for (let i = 1; i < this.columns.length; ++i) {
                const column = this.columns[i];

                const durationDelta = column.barColumn.position.fixedPointValue
                    - this.columns[i - 1].barColumn.position.fixedPointValue;
                const spacing = Math.min(spacingToDuration * durationDelta, barStyle.maxBeatSpacingRatio);

                x = Math.max(x + spacing,
                    column.lyricsSegment ? lastLyricsStop : 0,
                    column.chordDiagram ? lastChordStop : 0);

                column.relativePosition = x;

                if (column.lyricsSegment) {
                    lastLyricsStop = x + column.lyricsSegment.desiredSize.width;
                }

                if (column.chordDiagram) {
                    lastChordStop = x + column.chordDiagram.desiredSize.width;
                }
            }

            desiredWidth = Math.max(x, lastLyricsStop);
        }

        // measure voices to decide ceiling and floor sizes
        let desiredCeilingSize = 0;
        let desiredFloorSize = 0;

        for (let voice of this.voices) {
            voice.measure(availableSize);
            switch (VoicePart.getEpitaxyPosition(voice.voice.voicePart)) {
                case VerticalDirection.Above:
                    desiredCeilingSize = Math.max(desiredCeilingSize, voice.desiredEpitaxySize);
                    break;
                case VerticalDirection.Under:
                    desiredFloorSize = Math.max(desiredFloorSize, voice.desiredEpitaxySize);
                    break;
            }
        }

        this.setDesiredCeilingSize(desiredCeilingSize);
        this.setDesiredFloorSize(desiredFloorSize);

        const desiredHeight = barStyle.lineHeight * (Defaults.strings - 1)
            + this.desiredCeilingSize
            + this.desiredFloorSize;

        return new Size(desiredWidth, desiredHeight);
    }

    protected arrangeOverride(finalSize: Size): Size {
        let xScale = finalSize.width / this.desiredSize.width;

        if (xScale < 1) {
            // measure again if the final width is even smaller than we desired
            this.measure(finalSize);
            xScale = finalSize.width / this.desiredSize.width;
        }

        for (let column of this.columns) {
            column.arrange(new Rect(this.position.x + column.relativePosition * xScale,
                this.position.y + this.baseline,
                column.desiredSize.width,
                column.desiredSize.height));
        }

        for (let voice of this.voices) {
            voice.arrange(Rect.create(this.position, finalSize));
        }

        return finalSize;
    }

    destroy(): void {
        this.columns.forEach(c => c.destroy());
        this.columnSpacings.length = this.columns.length - 1;
        this.voices.forEach(v => v.destroy());
    }
}