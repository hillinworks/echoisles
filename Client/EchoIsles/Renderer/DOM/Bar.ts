import { WidgetBase } from "../WidgetBase";
import { Bar as CoreBar } from "../../Core/Sheet/Bar";
import { Voice } from "./Voice";
import { Size } from "../Size";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { Style } from "../Style";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { Defaults } from "../../Core/Sheet/Tablature/Defaults";
import { Rect } from "../Rect";
import { select } from "../../Core/Utilities/LinqLite";
import { Point } from "../Point";
import { DocumentRow } from "./DocumentRow";
import { BarColumn } from "./BarColumn";


export class Bar extends DocumentRow.Child {

    readonly columns = new Array<BarColumn>();
    private readonly columnSpacings = new Array<number>();
    private readonly voices = new Array<Voice>();

    constructor(parent: DocumentRow, public readonly bar: CoreBar) {
        super(parent);
        this.initializeComponents();
    }

    get bodyHeight(): number {
        return Style.current.bar.lineHeight * (Defaults.strings - 1);
    }

    private initializeComponents() {
        this.columns.push(...select(this.bar.columns, c => new BarColumn(this, c)));
        this.voices.push(...select([this.bar.bassVoice, this.bar.trebleVoice], v => new Voice(this, v)));
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
            let x = firstColumn.relativeNoteElementsBounds.width;
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
        let xScale = finalSize.width / this.desiredSize.width;

        if (xScale < 1) {
            // measure again if the final width is even smaller than we desired
            this.measure(finalSize);
            xScale = finalSize.width / this.desiredSize.width;
        }

        for (let column of this.columns) {
            column.arrange(new Rect(this.position.x + column.relativePosition * xScale,
                this.position.y + this.relativeBaseline,
                column.desiredSize.width,
                column.desiredSize.height));
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

export module Bar {
    export abstract class Child extends WidgetBase implements IDescendant {

        protected constructor(readonly ownerBar: Bar) {
            super(ownerBar);
        }

        get ownerRow(): DocumentRow {
            return this.ownerBar.ownerRow;
        }

    }

    export interface IDescendant extends DocumentRow.IDecendant {
        readonly ownerBar: Bar;
    }

    export interface IBarRelated {
        relativePosition: Point;
    }
}