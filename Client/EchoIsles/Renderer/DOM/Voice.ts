import { WidgetBase } from "../WidgetBase";
import { Voice as CoreVoice } from "../../Core/Sheet/Voice";

export class Voice extends WidgetBase {

    private _desiredEpitaxySize: number;

    constructor(parent: WidgetBase, readonly voice: CoreVoice) {
        super(parent);
    }

    get desiredEpitaxySize(): number {
        return this._desiredEpitaxySize;
    }
}