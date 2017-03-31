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

    constructor(parent: BeatWidgetBase.ParentType, readonly beam: CoreBeam) {
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
        this.elements.push(...select(this.beam.elements, e => BeatWidgetBase.create(this, e)));
        this.connector = new BeamConnector(this);
    }

    protected measureOverride(availableSize: Size): Size {
        if (this.beam.isRoot) {
            this.updateSlope();
            this.updateHeightMap();
        }

        let bounds = Rect.zero;
        for (let element of this.elements) {
            element.slope = this.slope;
            element.measure(availableSize);
            bounds = bounds.union(Rect.create(element.rootPosition, element.desiredSize));
        }

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
            element.slope = this.slope;

            // note rootPosition is relative to owner bar
            const x = this.ownerBar.position.x + element.rootPosition.x;
            const rootY = this.ownerBar.position.y + element.rootPosition.y;
            const y = this.ownerVoice.selectEpitaxy(
                above => rootY - element.desiredSize.height,
                under => rootY);
            const position = new Point(x, y);
            element.arrange(Rect.create(position, element.desiredSize));
            bounds = bounds.union(Rect.create(element.position, element.renderSize));
        }

        this.connector.setTerminals(this.ownerBar.position.translate(this.firstBeat.tipPosition),
            this.ownerBar.position.translate(this.lastBeat.tipPosition));
        this.connector.arrange(bounds);

        return bounds.size;
    }


    private updateSlope() {
        let maxSlope = Number.MIN_VALUE;
        let p0: Point | undefined = undefined;
        for (let beat of getAllBeats(this)) {
            beat.measureBody();

            if (p0) {
                const slope = (beat.tipPosition.y - p0.y) / (beat.tipPosition.x - p0.x);
                maxSlope = this.ownerVoice.epitaxyMax(maxSlope, Math.abs(slope));
            } else {
                p0 = beat.tipPosition;
                maxSlope = 0;
            }
        }

        this.slope = new BeamSlope(p0!.x, p0!.y, maxSlope);
    }

    private updateHeightMap() {
        const firstBeat = this.firstBeat;
        const lastBeat = this.lastBeat;
        this.ownerVoice.heightMap.ensureHeightSloped(
            this.ownerBar.relativePosition.x + firstBeat.tipPosition.x,
            lastBeat.tipPosition.x - firstBeat.tipPosition.x,
            firstBeat.desiredEpitaxySize.height,
            lastBeat.desiredEpitaxySize.height,
            Style.current.note.stem.horizontalMargin);
    }

    destroy() {
        this.destroyChildren(this.elements, this.connector);
    }
}