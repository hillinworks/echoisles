import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import { BeatWidgetBase } from "./BeatWidgetBase";
import { BarColumn } from "./BarColumn";
import { Point } from "../Point";
import { Size } from "../Size";
import { Style } from "../Style";
import { Defaults } from "../../Core/Sheet/Tablature/Defaults";
import { Flag } from "./Flag";
import { Stem } from "./Stem";

export class Beat extends BeatWidgetBase {

    private flag?: Flag;
    private stem?: Stem;

    /** the tip position relative to its owner bar */
    private _relativeTipPosition: Point;

    private bodyMeasured = false;

    constructor(parent: BeatWidgetBase.ParentType, readonly beat: CoreBeat) {
        super(parent);
        this.intializeComponents();
    }

    get ownerColumn(): BarColumn {
        return this.ownerBar.columns[this.beat.ownerColumn.index];
    }

    get relativeTipPosition(): Point {
        return this._relativeTipPosition;
    }

    get desiredEpitaxySize(): Size {
        return new Size(this.desiredSize.width,
            Math.abs(this.relativeTipPosition.y - this.ownerVoice.relativeEpitaxyBase));
    }

    private intializeComponents() {

    }

    invalidateLayout(): void {
        super.invalidateLayout();
        this.bodyMeasured = false;
    }

    measureBody(): void {

        const x = this.ownerColumn.relativePosition + this.ownerColumn.relativeNoteElementsBounds.width / 2;
        let y = this.ownerVoice.selectEpitaxy(
            above => this.ownerColumn.relativeNoteElementsBounds.top,
            under => this.ownerColumn.relativeNoteElementsBounds.bottom);
        this.protectedRelativeRootPosition = new Point(x, y);

        if (this.slope) {
            y = this.slope.getY(x);
        } else {
            const noteStyle = Style.current.note;

            y = this.ownerVoice.selectEpitaxy(
                above => Math.min(this.relativeRootPosition.y - noteStyle.stem.standardHeight,
                    -noteStyle.stem.minimumEpitaxy),
                under => Math.max(this.relativeRootPosition.y + noteStyle.stem.standardHeight,
                    Style.current.bar.lineHeight * (Defaults.strings - 1) + noteStyle.stem.minimumEpitaxy));
        }

        const stemTipPosition = new Point(x, y);

        if (this.stem) {
            this.stem.relativeRootPosition = this.protectedRelativeRootPosition;
            this.stem.relativeTipPosition = stemTipPosition;
        }

        if (this.flag) {
            this.flag.measure(Size.infinity);

            this.flag.relativePosition = stemTipPosition;

            const flagHeight = this.flag.desiredSize.height;
            y += this.ownerVoice.selectEpitaxy(
                above => -flagHeight,
                under => flagHeight);
        }

        this._relativeTipPosition = new Point(x, y);

        this.bodyMeasured = true;
    }

    protected measureOverride(availableSize: Size): Size {
        this.measureBody();

        // todo: measure other parts
    }

}