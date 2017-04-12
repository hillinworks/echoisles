import { Bar as CoreBar } from "../../Core/Sheet/Bar";
import { Voice } from "./Voice";
import { Size } from "../Size";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { Style } from "../Style";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { Defaults } from "../../Core/Sheet/Tablature/Defaults";
import { Rect } from "../Rect";
import { select, repeat } from "../../Core/Utilities/LinqLite";
import { Point } from "../Point";
import { DocumentRow } from "./DocumentRow";
import { BarColumn } from "./BarColumn";
import { Document } from "./Document";
import { DocumentRowChild } from "./DocumentRowChild";
import { BarHorizontalLine } from "./BarHorizontalLine";

export class Bar extends DocumentRowChild {

    readonly columns = new Array<BarColumn>();
    private readonly columnSpacings = new Array<number>();
    private readonly voices = new Array<Voice>();
    private readonly horizontalLines = new Array<Array<BarHorizontalLine>>();

    ownerRow: DocumentRow;

    constructor(parent: Document, public readonly bar: CoreBar) {
        super(parent);
        this.initializeComponents();
    }

    get bodyHeight(): number {
        return Style.current.bar.lineHeight * (Defaults.strings - 1);
    }

    private initializeComponents() {
        this.columns.push(...select(this.bar.columns, c => new BarColumn(this, c)));
        this.voices.push(...select([this.bar.bassVoice, this.bar.trebleVoice], v => new Voice(this, v)));

        for (let i = 0; i < Defaults.strings; ++i) {
            this.horizontalLines[i] = new Array<BarHorizontalLine>();
            this.horizontalLines[i].push(new BarHorizontalLine(this));
        }

        for (let column of this.columns) {
            for (let i = 0; i < this.horizontalLines.length; ++i) {
                if (column.isStringObstructed(i)) {
                    this.horizontalLines[i].push(new BarHorizontalLine(this));
                }
            }
        }
    }

    measureWidth(): number {
        // measure all columns first
        for (let column of this.columns) {
            column.measure(Size.infinity);
        }

        // decide column locations and measure desired width
        const barStyle = Style.current.bar;

        let desiredWidth = barStyle.horizontalPadding;

        if (this.columns.length > 0) {
            const spacingToDuration = barStyle.minBeatSpacing / this.bar.minimumBeatDuration.fixedPointValue;
            const maxBeatSpacing = barStyle.maxBeatSpacingRatio * barStyle.minBeatSpacing;

            const firstColumn = this.columns[0];
            firstColumn.relativePosition = desiredWidth;
            let x = desiredWidth + firstColumn.relativeNoteElementsBounds.width;
            let lastLyricsStop = desiredWidth + (firstColumn.lyricsSegment ? firstColumn.lyricsSegment.desiredSize.width : 0);
            let lastChordStop = desiredWidth + (firstColumn.chordDiagram ? firstColumn.chordDiagram.desiredSize.width : 0);

            for (let i = 1; i < this.columns.length; ++i) {
                const column = this.columns[i];

                const durationDelta = column.barColumn.position.fixedPointValue
                    - this.columns[i - 1].barColumn.position.fixedPointValue;
                const spacing = Math.max(Math.min(spacingToDuration * durationDelta, maxBeatSpacing), barStyle.minBeatSpacing);

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

        desiredWidth += barStyle.horizontalPadding;

        return desiredWidth;
    }

    protected measureOverride(availableSize: Size): Size {

        const desiredWidth = this.measureWidth();

        // measure voices to decide ceiling and floor sizes
        let desiredCeilingSize = 0;
        let desiredFloorSize = 0;

        for (let voice of this.voices) {
            voice.measure(availableSize);
            switch (VoicePart.getEpitaxyDirection(voice.voice.voicePart)) {
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

        const desiredHeight = this.bodyHeight + this.desiredCeilingSize + this.desiredFloorSize;

        return new Size(desiredWidth, desiredHeight);
    }

    protected arrangeOverride(finalSize: Size): Size {
        const horizontalPadding = Style.current.bar.horizontalPadding;

        const self = this;
        function calculateXScale() {
            return (finalSize.width - horizontalPadding * 2) / (self.desiredSize.width - horizontalPadding * 2);
        }

        let xScale = calculateXScale();

        if (xScale < 1) {
            // measure again if the final width is even smaller than we desired
            this.measure(finalSize);
            xScale = calculateXScale();
        }

        const horizontalLineCarets = [...repeat(0, this.horizontalLines.length)];
        const horizontalLinePositions = [...repeat(this.position.x, this.horizontalLines.length)];

        const baseline = this.position.y + this.relativeBaseline;

        const contentStartX = this.position.x + horizontalPadding;

        for (let column of this.columns) {
            const scaledRelativePosition = (column.relativePosition - horizontalPadding) * xScale;
            column.arrange(new Rect(contentStartX + scaledRelativePosition,
                baseline,
                column.desiredSize.width,
                column.desiredSize.height));

            // draw horizontal lines
            for (let i = 0; i < this.horizontalLines.length; ++i) {
                const hole = column.getStringHole(i);
                if (hole.size > 0) {
                    const horizontalLine = this.horizontalLines[i][horizontalLineCarets[i]];
                    horizontalLine.arrange(new Rect(horizontalLinePositions[i],
                        baseline + i * Style.current.bar.lineHeight,
                        hole.from - horizontalLinePositions[i],
                        Style.current.bar.horizontalLineThickness));

                    horizontalLinePositions[i] = hole.to;
                    ++horizontalLineCarets[i];
                }
            }
        }

        // draw horizontal lines till the end
        for (let i = 0; i < this.horizontalLines.length; ++i) {
            const horizontalLine = this.horizontalLines[i][horizontalLineCarets[i]];
            const x = horizontalLinePositions[i];
            horizontalLine.arrange(new Rect(x,
                baseline + i * Style.current.bar.lineHeight,
                this.position.x + finalSize.width - x,
                Style.current.bar.horizontalLineThickness));
        }

        for (let voice of this.voices) {
            const position = VerticalDirection.select(VoicePart.getEpitaxyDirection(voice.voice.voicePart),
                () => this.position.translate(new Point(0, -voice.desiredEpitaxySize)),
                () => this.position.translate(new Point(0, this.bodyHeight)));

            voice.arrange(Rect.create(position, finalSize));
        }

        return finalSize;
    }

    destroy(): void {
        this.columns.forEach(c => c.destroy());
        this.columnSpacings.length = this.columns.length - 1;
        this.voices.forEach(v => v.destroy());
    }
}