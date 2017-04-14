import { Point } from "../Point";
import { Style } from "../Style";
import { Size } from "../Size";

export function setPosition(target: fabric.Object, position: Point): void {
    target.setLeft(position.x);
    target.setTop(position.y);
}

export function setSize(target: fabric.Object, size: Size): void {
    target.setWidth(size.width);
    target.setHeight(size.height);
}

export function align(horizontal: "left" | "center" | "right" = "left", vertical: "top" | "center" | "bottom" = "top", setTextAlign = false) {
    return {
        originX: horizontal,
        originY: vertical,
        textAlign: setTextAlign ? horizontal : undefined
    };
}

export function centerAlign(setTextAlign = false) {
    return align("center", "center", setTextAlign);
}

export function stroke(color: string = "black", thickness: number = 1) {
    return {
        stroke: color,
        strokeWidth: thickness
    };
}

export function noFill() {
    return {
        fill: ""
    };
}

export function font(size: number, family?: string) {
    return {
        fontSize: size,
        fontFamily: family || Style.current.smuflFont
    };
}

export function makeStyle(...styles: any[]) {
    return Object.assign({}, ...styles);
}