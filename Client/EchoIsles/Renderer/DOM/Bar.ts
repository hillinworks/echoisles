import { Bar as CoreBar } from "../../Core/Sheet/Bar";
import { Voice } from "./Voice";
import { Size } from "../Size";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { Style } from "../Style";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { Rect } from "../Rect";
import { select, repeat } from "../../Core/Utilities/LinqLite";
import { Point } from "../Point";
import { BarColumn } from "./BarColumn";
import { Document } from "./Document";
import { BarHorizontalLine } from "./BarHorizontalLine";
import { getBarBodyHeight } from "./Utilities";
import { BarBase } from "./BarBase";
import { ChordDiagram } from "./ChordDiagram";
import { LyricsSegment } from "./LyricsSegment";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";

export class Bar extends BarBase {

    readonly columns = new Array<BarColumn>();
    private readonly columnSpacings = new Array<number>();
    private readonly voices = new Array<Voice>();
    private readonly chordDiagrams = new Array<ChordDiagram | undefined>();
    private readonly lyricsSegments = new Array<LyricsSegment | undefined>();

    private _desiredWidth: number;

    constructor(parent: Document, public readonly bar: CoreBar) {
        super(parent);
        this.initializeComponents();
    }

    get desiredWidth(): number {
        return this._desiredWidth;
    }

    private initializeComponents() {

        for (let column of this.bar.columns) {
            this.columns.push(new BarColumn(this, column));

            // create chord diagram if existed
            if (column.chord && column.isFirstOfSegment) {
                const chord = (this.bar.documentState as TablatureState).resolveChord(column.chord);
                this.chordDiagrams.push(new ChordDiagram(this, chord!));
            } else {
                this.chordDiagrams.push(undefined);
            }

            //create lyrics segment if existed
            if (column.lyrics) {
                this.lyricsSegments.push(new LyricsSegment(this, column.lyrics));
            } else {
                this.lyricsSegments.push(undefined);
            }
        }

        this.columns.push(...select(this.bar.columns, c => new BarColumn(this, c)));
        this.voices.push(...select([this.bar.bassVoice, this.bar.trebleVoice], v => new Voice(this, v)));

        for (let column of this.columns) {
            for (let i = 0; i < this.horizontalLines.length; ++i) {
                if (column.isStringObstructed(i)) {
                    this.horizontalLines[i].push(new BarHorizontalLine(this));
                }
            }
        }
    }

    preMeasure(): number {
        // measure all columns first
        for (let column of this.columns) {
            column.invalidateLayout();  // force the measure to happen
            column.measure(Size.infinity);
        }

        // decide column locations and measure desired width
        const barStyle = Style.current.bar;

        let desiredWidth = barStyle.horizontalPadding;

        if (this.columns.length > 0) {
            const spacingToDuration = barStyle.minBeatSpacing / this.bar.minimumBeatDuration.fixedPointValue;
            const maxBeatSpacing = barStyle.maxBeatSpacingRatio * barStyle.minBeatSpacing;

            const firstColumn = this.columns[0];
            const firstLyricsSegment = this.lyricsSegments[0];
            const firstChordDiagram = this.chordDiagrams[0];
            firstColumn.relativePosition = desiredWidth;
            let x = desiredWidth + firstColumn.desiredSize.width;
            let lastLyricsStop = desiredWidth + (firstLyricsSegment ? firstLyricsSegment.desiredSize.width : 0);
            let lastChordStop = desiredWidth + (firstChordDiagram ? firstChordDiagram.desiredSize.width : 0);

            for (let i = 1; i < this.columns.length; ++i) {
                const column = this.columns[i];
                const lyricsSegment = this.lyricsSegments[i];
                const chordDiagram = this.chordDiagrams[i];

                const durationDelta = column.barColumn.position.fixedPointValue
                    - this.columns[i - 1].barColumn.position.fixedPointValue;
                const spacing = Math.max(Math.min(spacingToDuration * durationDelta, maxBeatSpacing), barStyle.minBeatSpacing);

                x = Math.max(x + spacing,
                    lyricsSegment ? lastLyricsStop : 0,
                    chordDiagram ? lastChordStop : 0);

                column.relativePosition = x;

                if (lyricsSegment) {
                    lyricsSegment.measure(Size.infinity);
                    lastLyricsStop = x + lyricsSegment.desiredSize.width;
                }

                if (chordDiagram) {
                    chordDiagram.measure(Size.infinity);
                    lastChordStop = x + chordDiagram.desiredSize.width;
                }
            }

            desiredWidth = Math.max(x, lastLyricsStop);
        }

        desiredWidth += barStyle.horizontalPadding;

        this._desiredWidth = desiredWidth;
        return desiredWidth;
    }

    protected measureOverride(availableSize: Size): Size {
        // preMeasure should be called again because the first time it's been called, we are not placed 
        // into a row yet
        this.preMeasure();

        for (let voice of this.voices) {
            voice.measure(availableSize);
        }

        // desired height is omitted, height is decided by height maps in document rows
        return new Size(this.desiredWidth, Number.NaN);
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
                    horizontalLineCarets[i] += 1;
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
                () => this.position.translate(new Point(0, getBarBodyHeight())));

            voice.arrange(Rect.create(position, finalSize));
        }

        return finalSize;
    }

    postArrange(): void {
        for (let i = 0; i < this.columns.length; ++i) {
            const column = this.columns[i];

            const chordDiagram = this.chordDiagrams[i];
            if (chordDiagram) {
                const position = new Point(-Style.current.bar.ceilingSpacing - chordDiagram.desiredSize.height, 0);
                chordDiagram.arrange(Rect.create(column.position.translate(position), chordDiagram.desiredSize));
            }

            const lyricsSegment = this.lyricsSegments[i];
            if (lyricsSegment) {
                const position = new Point(Style.current.bar.floorSpacing + lyricsSegment.desiredSize.height, 0);
                lyricsSegment.arrange(Rect.create(column.position.translate(position), lyricsSegment.desiredSize));
            }
        }
    }

    destroy(): void {
        super.destroy();
        this.destroyChildren(this.columns, this.voices);
        this.columnSpacings.length = this.columns.length - 1;
    }
}