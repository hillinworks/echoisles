export class BeamSlope {

    constructor(readonly x0: number, readonly y0: number, readonly slope: number) { }

    getY(x1: number): number {
        return this.slope * (x1 - this.x0) + this.y0;
    }

}