import { Point } from "../Point";
import { Style } from "../Style";
import { ISizeLike } from "../ISizeLike";
import {Defaults} from "../../Core/Sheet/Tablature/Defaults";

export function getBarBodyHeight(): number {
    return Style.current.bar.lineHeight * (Defaults.strings - 1);
}

export function setPosition(target: fabric.Object, position: Point): void {
    target.setLeft(position.x);
    target.setTop(position.y);
}

export function setSize(target: fabric.Object, size: ISizeLike): void {
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

export function stroke(color: string | undefined = "black", thickness: number | undefined = 1) {
    return {
        stroke: color,
        strokeWidth: thickness
    };
}

export function noStroke() {
    return {
        stroke: "",
        strokeWidth: 0
    };
}

export function fill(color: string = "black") {
    return {
        fill: color
    };
}

export function noFill() {
    return {
        fill: ""
    };
}

export function radius(radius: number) {
    return {
        radius: radius
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