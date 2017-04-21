import { BeatWidget } from "./BeatWidget";
import { Voice as CoreVoice } from "../../Core/Sheet/Voice";
import { BeatWidgetBase } from "./BeatWidgetBase";
import { select } from "../../Core/Utilities/LinqLite";
import { Bar } from "./Bar";
import { Size } from "../Size";
import { Rect } from "../Rect";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { HeightMap } from "./HeightMap";
import { BarChild } from "./BarChild";
import {getBarBodyHeight} from "./Utilities";

export class Voice extends BarChild {

    private _desiredEpitaxySize = 0;

    private readonly beatWidgets = new Array<BeatWidgetBase>();

    /** the base y position of this Voice's epitaxy */
    readonly relativeEpitaxyBase: number;

    readonly epitaxyMax: (a: number, b: number) => number;

    constructor(parent: Bar, readonly voice: CoreVoice) {
        super(parent);
        this.initializeComponents();

        switch (this.epitaxyDirection) {
            case VerticalDirection.Above:
                this.relativeEpitaxyBase = 0;
                this.epitaxyMax = Math.min;
                break;
            case VerticalDirection.Under:
                this.relativeEpitaxyBase = getBarBodyHeight();
                this.epitaxyMax = Math.max;
                break;
        }
    }

    get desiredEpitaxySize(): number {
        return this._desiredEpitaxySize;
    }

    /** get a VerticalDirection value representing this voice's epitaxy direction */
    get epitaxyDirection(): VerticalDirection {
        return VoicePart.getEpitaxyDirection(this.voice.voicePart);
    }

    get heightMap(): HeightMap {
        return this.ownerRow.getHeightMap(this.voice.voicePart);
    }

    selectEpitaxy<T>(above: (above: void) => T, under: (under: void) => T) {
        return VerticalDirection.select(this.epitaxyDirection, above, under);
    }

    transformEpitaxy(value: number): number {
        return this.selectEpitaxy(above => -value, under => value);
    }

    private initializeComponents() {
        this.beatWidgets.push(...select(this.voice.elements, e => BeatWidget.create(this, e)));
    }

    protected measureOverride(availableSize: Size): Size {

        let bounds = Rect.zero;
        for (let widget of this.beatWidgets) {
            widget.measure(availableSize);
            bounds = bounds.union(Rect.create(widget.barRelatedPosition, widget.desiredSize));
        }

        return bounds.size;
    }

    protected arrangeOverride(finalSize: Size): Size {
        let bounds = Rect.create(this.position);
        for (let widget of this.beatWidgets) {
            const position = this.position.translate(widget.barRelatedPosition);
            widget.arrange(Rect.create(position, widget.desiredSize));
            bounds = bounds.union(Rect.create(widget.position, widget.renderSize));
        }

        return bounds.size;
    }

    destroy() {
        this.destroyChildren(this.beatWidgets);
    }
}
