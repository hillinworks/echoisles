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

export class Beat extends BeatWidgetBase {

    private flag?: Flag;
    private stem?: Stem;
    private readonly modifiers = new Array<BeatModifier>();
    private readonly semiBeamConnectors = new Array<BeamConnector>();
    private tuplet?: Tuplet;
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

    private intializeComponents() {
        const noteValue = this.beat.noteValue;

        if (!this.beat.isRest) {

            if (noteValue.base <= BaseNoteValue.Half) {
                this.stem = new Stem(this, noteValue.base);
            }

            if (this.parent instanceof Beam) {
                let baseNoteValue = noteValue.base;
                while (baseNoteValue !== this.parent.beam.beatNoteValue) {
                    this.semiBeamConnectors.push(new BeamConnector(this));
                    baseNoteValue = BaseNoteValue.double(baseNoteValue);
                }
            } else {
                if (noteValue.base <= BaseNoteValue.Eighth) {
                    this.flag = new Flag(this, noteValue.base);
                }
            }
        }

        if (!(this.parent instanceof Beam)) {
            const tuplet = noteValue.tuplet;
            if (tuplet !== undefined) {
                this.tuplet = new Tuplet(this, tuplet);
            }
        }

        switch (this.beat.strumTechnique) {
            case StrumTechnique.Rasgueado:
            case StrumTechnique.PickstrokeDown:
            case StrumTechnique.PickstrokeUp:
                this.modifiers.push(new BeatModifier(this, StrumTechnique.toBeatModifier(this.beat.strumTechnique)));
                break;
        }

        if (this.beat.accent !== BeatAccent.Normal) {
            this.modifiers.push(new BeatModifier(this, BeatAccent.toBeatModifier(this.beat.accent)));
        }

        if (this.beat.holdAndPause !== HoldAndPause.None) {
            this.modifiers.push(new BeatModifier(this, HoldAndPause.toBeatModifier(this.beat.holdAndPause)));
        }

        if (this.beat.ornament !== Ornament.None) {
            this.modifiers.push(new BeatModifier(this, Ornament.toBeatModifier(this.beat.ornament)));
        }

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
        this.protectedRootPosition = new Point(x, y);

        let bounds = Rect.zero;

        if (this.slope) {
            y = this.slope.getY(x);
        } else {
            const noteStyle = Style.current.note;

            y = this.ownerVoice.epitaxyMax(
                this.rootPosition.y + this.ownerVoice.transformEpitaxy(noteStyle.stem.standardHeight),
                this.ownerVoice.relativeEpitaxyBase + this.ownerVoice.transformEpitaxy(noteStyle.stem.minimumEpitaxy));
        }

        let stemTipPosition = Point.zero;

        if (this.stem) {
            this.stem.relativePosition = stemTipPosition;
            this.stem.measure(new Size(Number.POSITIVE_INFINITY, Math.abs(y - this.rootPosition.y)));

            stemTipPosition = stemTipPosition.translate(new Vector(0, this.ownerVoice.transformEpitaxy(this.stem.desiredSize.height)));

            bounds = bounds.union(Rect.create(this.stem.relativePosition, this.stem.desiredSize));
        }

        if (this.flag) {
            this.flag.relativePosition = stemTipPosition;
            this.flag.measure(Size.infinity);

            bounds = bounds.union(Rect.create(this.flag.relativePosition, this.flag.desiredSize));

            const flagHeight = this.flag.desiredSize.height;
            y += this.ownerVoice.transformEpitaxy(flagHeight);
        }

        this._tipPosition = new Point(x, y);

        return bounds;
    }

    protected measureOverride(availableSize: Size): Size {
        let bounds = this.measureBody();

        if (this.tremolo) {
            const stem = this.stem!;
            this.tremolo.relativePosition = stem.relativePosition.translate(new Vector(0,
                this.ownerVoice.transformEpitaxy(stem.desiredSize.height - Style.current.note.tremoloOffset)));
            this.tremolo.measure(Size.infinity);
            bounds = bounds.union(Rect.create(this.tremolo.relativePosition, this.tremolo.desiredSize));
        }

        // todo: last done here

        // y is an abstract value, when applied to relative positions, it will be transformed by ownerVoice.transformEpitaxy
        let y = Math.abs(this.ownerVoice.selectEpitaxy(above => bounds.top, under => bounds.bottom));
        y += Style.current.beam.minimumVerticalPadding;

        


    }

    destroy() {
        this.destroyChildren(this.flag, this.stem, this.modifiers, this.semiBeamConnectors, this.tuplet, this.tremolo);
    }
}