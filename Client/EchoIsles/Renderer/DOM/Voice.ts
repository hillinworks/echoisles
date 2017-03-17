import { WidgetBase } from "../WidgetBase";
import { Voice as CoreVoice } from "../../Core/Sheet/Voice";

export class Voice extends WidgetBase {

    constructor(parent: WidgetBase, private readonly voice: CoreVoice) {
        super(parent);
    }
}