export class CapoInfo {
    readonly position: number;
    readonly affectedStrings: number[];

    constructor(position: number, affectedStrings: number[] = CapoInfo.affectAllStrings) {
        this.position = position;
        this.affectedStrings = affectedStrings;
    }
}

export module CapoInfo {
    export const affectAllStrings = new Array<number>();
    export const noCapo = new CapoInfo(0);
}