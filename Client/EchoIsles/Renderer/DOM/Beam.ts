import { BeatWidget } from "./BeatWidget";
import { BeatWidgetBase } from "./BeatWidgetBase";
import { Beam as CoreBeam } from "../../Core/Sheet/Beam";
import { BeamSlope } from "./BeamSlope";
import { Beat } from "./Beat";
import { select } from "../../Core/Utilities/LinqLite";
import { Size } from "../Size";
import { Point } from "../Point";
import { Rect } from "../Rect";
import { BeamConnector } from "./BeamConnector";
import { Style } from "../Style";
import { BaseNoteValue } from "../../Core/MusicTheory/BaseNoteValue";
import { Vector } from "../Vector";
import { BeamContext } from "./BeamContext";


function* getAllBeats(beam: Beam): Iterable<Beat> {
    for (let element of beam.elements) {
        if (element instanceof Beat) {
            yield element;
        } else if (element instanceof Beam) {
            for (let beat of getAllBeats(element)) {
                yield beat;
            }
        } else {
            throw new Error();
        }
    }
}

export class Beam extends BeatWidgetBase {

    readonly elements = new Array<BeatWidgetBase>();
    private connector: BeamConnector;

    private _desiredEpitaxySize: Size;

    constructor(readonly parent: BeatWidgetBase.ParentType, readonly beam: CoreBeam) {
        super(parent);
        this.initializeComponents();
    }

    get firstBeat(): Beat {
        let beam: Beam = this;
        while (true) {
            const firstElement = beam.elements[0];
            if (firstElement instanceof Beat) {
                return firstElement;
            }

            beam = firstElement as Beam;
        }
    }

    get lastBeat(): Beat {
        let beam: Beam = this;
        while (true) {
            const lastElement = beam.elements[beam.elements.length - 1];
            if (lastElement instanceof Beat) {
                return lastElement;
            }

            beam = lastElement as Beam;
        }
    }

    get desiredEpitaxySize(): Size {
        return this._desiredEpitaxySize;
    }

    private initializeComponents() {
        this.elements.push(...select(this.beam.elements, e => BeatWidget.create(this, e)));
        this.connector = new BeamConnector(this, this.beam.beatNoteValue);
    }

    protected measureOverride(availableSize: Size): Size {
        if (this.beam.isRoot) {
            this.updateSlope();
            this.updateHeightMap();
        }

        let bounds = Rect.zero;
        for (let element of this.elements) {
            element.context = this.context;
            element.measure(availableSize);
            bounds = bounds.union(Rect.create(element.barRelatedPosition, element.desiredSize));
        }

        this.barRelatedPosition = this.firstBeat.barRelatedPosition;

        this._desiredEpitaxySize = new Size(
            bounds.width,
            this.ownerVoice.selectEpitaxy(
                above => -bounds.top,
                under => bounds.bottom - this.ownerVoice.relativeEpitaxyBase));

        return bounds.size;
    }

    protected arrangeOverride(finalSize: Size): Size {
        let bounds = Rect.create(this.position);
        for (let element of this.elements) {
            element.context = this.context;

            // note barRelatedPosition is relative to owner bar
            const x = this.ownerBar.position.x + element.barRelatedPosition.x;
            const rootY = this.ownerBar.position.y + element.barRelatedPosition.y;
            const y = this.ownerVoice.selectEpitaxy(
                above => rootY - element.desiredSize.height,
                under => rootY);
            const position = new Point(x, y);
            element.arrange(Rect.create(position, element.desiredSize));
            bounds = bounds.union(Rect.create(element.position, element.renderSize));
        }

        const connectorVerticalOffset =
            this.ownerVoice.transformEpitaxy(this.getConnectorVerticalOffset(this.beam.beatNoteValue));
        const connectorTip1 =
            this.firstBeat.tipPosition.translate(new Vector(0, connectorVerticalOffset));
        const connectorTip2 =
            this.lastBeat.tipPosition.translate(new Vector(0, connectorVerticalOffset));

        this.connector.setTerminals(this.ownerBar.position.translate(connectorTip1),
            this.ownerBar.position.translate(connectorTip2));
        this.connector.arrange(bounds);

        return bounds.size;
    }


    private updateSlope() {
        let maxSlope = Number.MIN_VALUE;
        let p0: Point | undefined = undefined;
        let minNoteValue = this.beam.beatNoteValue;
        for (let beat of getAllBeats(this)) {

            minNoteValue = Math.min(minNoteValue, beat.beat.noteValue.base);

            beat.measureBody();

            if (p0) {
                const slope = (beat.tipPosition.y - p0.y) / (beat.tipPosition.x - p0.x);
                maxSlope = this.ownerVoice.epitaxyMax(maxSlope, Math.abs(slope));
            } else {
                p0 = beat.tipPosition;
                maxSlope = 0;
            }
        }

        const additionalSpaceForBeamConnectors = (this.beam.beatNoteValue - minNoteValue)
            * (Style.current.beam.connectorThickness + Style.current.beam.connectorSpacing);

        const slope = new BeamSlope(p0!.x, p0!.y + this.ownerVoice.transformEpitaxy(additionalSpaceForBeamConnectors), maxSlope);
        this.context = new BeamContext(this, slope);
    }

    private updateHeightMap() {
        const firstBeat = this.firstBeat;
        const lastBeat = this.lastBeat;
        this.ownerVoice.heightMap.ensureHeightSloped(
            this.ownerBar.relativePosition.x + firstBeat.tipPosition.x,
            lastBeat.tipPosition.x - firstBeat.tipPosition.x,
            firstBeat.desiredEpitaxySize.height + Style.current.beam.minimumVerticalPadding,
            lastBeat.desiredEpitaxySize.height + Style.current.beam.minimumVerticalPadding,
            Style.current.note.stem.horizontalMargin);
    }

    destroy() {
        this.destroyChildren(this.elements, this.connector);
    }

    getConnectorVerticalOffset(noteValue: BaseNoteValue): number {
        if (noteValue >= this.beam.beatNoteValue) {
            return 0;
        }

        return -(noteValue - this.beam.beatNoteValue)
            * (Style.current.beam.connectorSpacing + Style.current.beam.connectorThickness);
    }
}

