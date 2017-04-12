import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import { BeatWidgetBase } from "./BeatWidgetBase";
import { BarColumn } from "./BarColumn";
import { Point } from "../Point";
import { Size } from "../Size";
import { Style } from "../Style";
import { Flag } from "./Flag";
import { Stem } from "./Stem";
import { BeatModifier } from "./BeatModifier";
import { BeamConnector } from "./BeamConnector";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Beam } from "./Beam";
import { Tuplet } from "./Tuplet";
import { StrumTechnique } from "../../Core/MusicTheory/String/Plucked/StrumTechnique";
import { BeatAccent } from "../../Core/MusicTheory/BeatAccent";
import { HoldAndPause } from "../../Core/MusicTheory/HoldAndPause";
import { Ornament } from "../../Core/MusicTheory/Ornament";
import { Tremolo } from "./Tremolo";
import { NoteRepetition } from "../../Core/MusicTheory/NoteRepetition";
import { Rect } from "../Rect";
import { Vector } from "../Vector";
import { WidgetBase } from "../WidgetBase";
import { ArtificialHarmonicsMarker } from "./ArtificialHarmonicsMarker";
import { L } from "../../Core/Utilities/LinqLite";
import { NoteEffectTechnique } from "../../Core/MusicTheory/NoteEffectTechnique";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import {IBarRelated} from "./IBarRelated";

export class Beat extends BeatWidgetBase {

    private flag?: Flag;
    private stem?: Stem;
    private readonly modifiers = new Array<BeatModifier>();
    private readonly semiBeamConnectors = new Array<BeamConnector>();
    private tuplet?: Tuplet;
    private readonly artificialHarmonicsMarkers = new Array<ArtificialHarmonicsMarker>();
    private tremolo?: Tremolo;

    /** the tip position relative to owner bar */
    private _tipPosition: Point;

    constructor(parent: BeatWidgetBase.ParentType, readonly beat: CoreBeat) {
        super(parent);
        this.intializeComponents();
    }

    get ownerColumn(): BarColumn {
        return this.ownerBar.columns[this.beat.ownerColumn.index];
    }

    get tipPosition(): Point {
        return this._tipPosition;
    }

    get desiredEpitaxySize(): Size {
        const height = Math.abs(this._tipPosition.y - this.ownerVoice.relativeEpitaxyBase);
        return new Size(this.desiredSize.width, height);
    }

    private *getAllChildren(): Iterable<WidgetBase & IBarRelated> {
        if (this.stem) {
            yield this.stem;
        }

        if (this.tremolo) {
            yield this.tremolo;
        }

        yield* this.semiBeamConnectors;

        if (this.flag) {
            yield this.flag;
        }

        if (this.tuplet) {
            yield this.tuplet;
        }


        yield* this.modifiers;

        yield* this.artificialHarmonicsMarkers;
    }

    private intializeComponents() {
        const noteValue = this.beat.noteValue;

        if (!this.beat.isRest) {

            // stem
            if (noteValue.base <= BaseNoteValue.Half) {
                this.stem = new Stem(this, noteValue.base);
            }

            if (this.parent instanceof Beam) {
                //semi-beam-connector
                let baseNoteValue = noteValue.base;
                while (baseNoteValue !== this.parent.beam.beatNoteValue) {
                    this.semiBeamConnectors.push(new BeamConnector(this, baseNoteValue));
                    baseNoteValue = BaseNoteValue.double(baseNoteValue);
                }
            } else {
                // flag
                if (noteValue.base <= BaseNoteValue.Eighth) {
                    this.flag = new Flag(this, noteValue.base);
                }
            }

            if (!this.beat.isTied) {
                // artificial harmonic markers
                const notes = L(this.beat.notes)
                    .where(n => !n.isTied && n.effectTechnique === NoteEffectTechnique.ArtificialHarmonic);
                const orderedNotes = this.ownerVoice.selectEpitaxy(
                    above => notes.orderByDescending(n => n.string),
                    under => notes.orderBy(n => n.string));

                const tablatureState = this.beat.ownerBar.documentState as TablatureState;
                if (notes.all(n => n.effectTechniqueParameter === undefined
                    || n.effectTechniqueParameter - tablatureState.capoFretOffsets[n.string] === 12)) {
                    this.artificialHarmonicsMarkers.push(new ArtificialHarmonicsMarker(this));
                }
                for (let note of orderedNotes) {

                    let fret: number | undefined = undefined;
                    if (note.effectTechniqueParameter !== undefined
                        && note.effectTechniqueParameter - tablatureState.capoFretOffsets[note.string] !== 12) {
                        fret = note.effectTechniqueParameter - tablatureState.capoFretOffsets[note.string];
                    }
                    this.artificialHarmonicsMarkers.push(new ArtificialHarmonicsMarker(this, fret));
                }

            }
        }

        if (!(this.parent instanceof Beam)) {
            // tuplet
            const tuplet = noteValue.tuplet;
            if (tuplet !== undefined) {
                this.tuplet = new Tuplet(this, tuplet);
            }
        }

        // strum techniques
        switch (this.beat.strumTechnique) {
            case StrumTechnique.Rasgueado:
            case StrumTechnique.PickstrokeDown:
            case StrumTechnique.PickstrokeUp:
                this.modifiers.push(new BeatModifier(this, StrumTechnique.toBeatModifier(this.beat.strumTechnique)));
                break;
        }

        // accent
        if (this.beat.accent !== BeatAccent.Normal) {
            this.modifiers.push(new BeatModifier(this, BeatAccent.toBeatModifier(this.beat.accent)));
        }

        // hold and pause
        if (this.beat.holdAndPause !== HoldAndPause.None) {
            this.modifiers.push(new BeatModifier(this, HoldAndPause.toBeatModifier(this.beat.holdAndPause)));
        }

        // ornament
        if (this.beat.ornament !== Ornament.None) {
            this.modifiers.push(new BeatModifier(this, Ornament.toBeatModifier(this.beat.ornament)));
        }

        // note repetition
        switch (this.beat.noteRepetition) {
            case NoteRepetition.Tremolo:
                this.tremolo = new Tremolo(this);
                break;
        }
    }

    measureBody(): Rect {

        const x = this.ownerColumn.relativePosition + this.ownerColumn.relativeNoteElementsBounds.width / 2;
        let y = this.ownerVoice.selectEpitaxy(
            above => this.ownerColumn.relativeNoteElementsBounds.top,
            under => this.ownerColumn.relativeNoteElementsBounds.bottom);
        this.barRelatedPosition = new Point(x, y);

        let bounds = Rect.zero;

        if (this.context) {
            y = this.context.getBeatTipPosition(x, this.beat.noteValue.base);
        } else {
            const noteStyle = Style.current.note;

            y = this.ownerVoice.epitaxyMax(
                this.barRelatedPosition.y + this.ownerVoice.transformEpitaxy(noteStyle.stem.standardHeight),
                this.ownerVoice.relativeEpitaxyBase + this.ownerVoice.transformEpitaxy(noteStyle.stem.minimumEpitaxy));
        }

        let stemTipPosition = Point.zero;

        if (this.stem) {
            this.stem.barRelatedPosition = stemTipPosition;
            this.stem.measure(new Size(Number.POSITIVE_INFINITY, Math.abs(y - this.barRelatedPosition.y)));

            stemTipPosition = stemTipPosition.translate(new Vector(0, this.ownerVoice.transformEpitaxy(this.stem.desiredSize.height)));

            bounds = bounds.union(Rect.create(this.stem.barRelatedPosition, this.stem.desiredSize));
        }

        if (this.flag) {
            this.flag.barRelatedPosition = stemTipPosition;
            this.flag.measure(Size.infinity);

            bounds = bounds.union(Rect.create(this.flag.barRelatedPosition, this.flag.desiredSize));

            const flagHeight = this.flag.desiredSize.height;
            y += this.ownerVoice.transformEpitaxy(flagHeight);
        }

        this._tipPosition = new Point(x, y);

        const xRelativeToRow
            = this.ownerBar.getXRelativeToOwnerRow(
                this.barRelatedPosition.x - bounds.width / 2 - Style.current.note.stem.horizontalMargin);
        const occupiedWidth = bounds.width + Style.current.note.stem.horizontalMargin * 2;

        this.ownerVoice.heightMap.ensureHeight(xRelativeToRow,
            occupiedWidth,
            Math.abs(y - this.ownerVoice.relativeEpitaxyBase));

        return bounds;
    }

    protected measureOverride(availableSize: Size): Size {
        let bounds = this.measureBody();

        if (this.tremolo) {
            const stem = this.stem!;
            this.tremolo.barRelatedPosition = stem.barRelatedPosition.translate(new Vector(0,
                this.ownerVoice.transformEpitaxy(stem.desiredSize.height - Style.current.note.tremoloOffset)));
            this.tremolo.measure(Size.infinity);
            bounds = bounds.union(Rect.create(this.tremolo.barRelatedPosition, this.tremolo.desiredSize));
        }

        this.updateSemiBeamConnectorPositions();
        for (let semiBeam of this.semiBeamConnectors) {
            semiBeam.barRelatedPosition = this.barRelatedPosition;
            semiBeam.measure(availableSize);
            // todo: count semiBeam's bounds
        }

        if (this.tuplet) {
            this.tuplet.measure(Size.infinity);
            bounds = this.layoutModifierLike(this.tuplet, availableSize, bounds);
        }

        for (let marker of this.artificialHarmonicsMarkers) {
            marker.measure(Size.infinity);
            bounds = this.layoutModifierLike(marker, availableSize, bounds);
        }

        for (let modifier of this.modifiers) {
            modifier.measure(Size.infinity);
            bounds = this.layoutModifierLike(modifier, availableSize, bounds);
        }

        return bounds.size;
    }

    protected arrangeOverride(finalSize: Size): Size {
        this.measure(finalSize);

        for (let child of this.getAllChildren()) {
            let position = this.ownerBar.position.translate(child.barRelatedPosition);
            if (this.ownerVoice.epitaxyDirection === VerticalDirection.Above) {
                position = position.translate(new Vector(0, -child.desiredSize.height));
            }
            child.arrange(Rect.create(position, child.desiredSize));
        }

        return this.desiredSize;
    }

    private layoutModifierLike(modifier: WidgetBase & IBarRelated, availableSize: Size, bounds: Rect): Rect {

        const xRelativeToRow
            = this.ownerBar.getXRelativeToOwnerRow(
                this.barRelatedPosition.x - modifier.desiredSize.width / 2 - Style.current.note.modifierMargin);
        const occupiedWidth = modifier.desiredSize.width + Style.current.note.modifierMargin * 2;

        // height get from heightMap is relative to epitaxy base
        let height = this.ownerVoice.heightMap.getHeight(xRelativeToRow, occupiedWidth);

        modifier.barRelatedPosition = new Point(this.barRelatedPosition.x - modifier.desiredSize.width / 2,
            this.ownerVoice.relativeEpitaxyBase + this.ownerVoice.transformEpitaxy(height));

        bounds = bounds.union(Rect.create(modifier.barRelatedPosition, modifier.desiredSize));

        height += modifier.desiredSize.height + Style.current.note.modifierMargin;

        this.ownerVoice.heightMap.setHeight(xRelativeToRow, occupiedWidth, height);

        return bounds;
    }

    private updateSemiBeamConnectorPositions() {
        if (this.semiBeamConnectors.length > 0) {
            const isLastBeat = (this.parent instanceof Beam) && this === this.parent.lastBeat;

            let x1: number, x2: number;
            if (isLastBeat) {
                const previousColumn = this.ownerBar.columns[this.ownerColumn.barColumn.index - 1];
                x1 = previousColumn.relativePosition + previousColumn.relativeNoteElementsBounds.width / 2;
                x2 = this.barRelatedPosition.x;
                const width = Math.min(Style.current.beam.maximumSemiBeamWidth, (x2 - x1) / 2);
                x1 = x2 - width;
            } else {
                const nextColumn = this.ownerBar.columns[this.ownerColumn.barColumn.index + 1];
                x1 = this.barRelatedPosition.x;
                x2 = nextColumn.relativePosition + nextColumn.relativeNoteElementsBounds.width / 2;
                const width = Math.min(Style.current.beam.maximumSemiBeamWidth, (x2 - x1) / 2);
                x2 = x1 + width;
            }

            for (let semiBeam of this.semiBeamConnectors) {
                const y1 = this.context!.getBeamConnectorPosition(x1, semiBeam.noteValue);
                const y2 = this.context!.getBeamConnectorPosition(x2, semiBeam.noteValue);
                semiBeam.setTerminals(new Point(x1, y1), new Point(x2, y2));
            }
        }
    }

    destroy() {
        for (let child of this.getAllChildren()) {
            child.destroy();
        }
    }
}

export module Beat {
    export abstract class Child extends WidgetBase {

        /** a position relative to its owner bar */
        barRelatedPosition: Point;


    }
}