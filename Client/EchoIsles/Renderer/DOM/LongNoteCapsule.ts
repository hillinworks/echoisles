import { Note } from "./Note";
import { BarColumn } from "./BarColumn";
import { BarColumnChild } from "./BarColumnChild";
import { makeStyle, stroke, centerAlign, noFill, setPosition } from "./Utilities";
import { Size } from "../Size";
import { Rect } from "../Rect";
import { Style } from "../Style";
import { Vector } from "../Vector";
import { minMax } from "../../Core/Utilities/LinqLite";

export class LongNoteCapsule extends BarColumnChild {

    private path: fabric.Path;
    readonly stringRange: { min: number, max: number };

    constructor(owner: BarColumn, readonly notes: Note[]) {
        super(owner);
        this.stringRange = minMax(notes, n => n.string);
        this.initializeComponents();
    }

    private initializeComponents() {
        this.path = new fabric.Path(undefined, makeStyle(centerAlign(), stroke(), noFill()));
        this.root!.canvas.add(this.path);
    }

    protected measureOverride(availableSize: Size): Size {
        let bounds: Rect | undefined = undefined;
        const noteMargin = Style.current.note.head.margin;
        for (let note of this.notes) {
            const position = note.relativePosition.translate(new Vector(noteMargin, noteMargin));
            const size = note.desiredSize.inflate(new Size(-noteMargin, -noteMargin));
            if (bounds) {
                bounds = bounds.union(Rect.create(position, size));
            } else {
                bounds = Rect.create(position, size);
            }
        }

        if (this.notes.length === 1) {
            const size = Math.max(bounds!.width, bounds!.height);
            return new Size(size, size);
        }

        const padding = Style.current.note.head.capsulePadding;
        bounds = bounds!.inflate(new Size(padding, padding));

        return bounds.size;
    }

    protected arrangeOverride(finalSize: Size): Size {
        const padding = Style.current.note.head.capsulePadding;
        const r = finalSize.width / 2 + padding;
        const halfHeight = finalSize.height / 2 + padding;

        setPosition(this.path, this.position);
        this.path.set("path", [
            ["M", -r, -halfHeight + r],
            ["A", r, r, 0, 0, 1, r, -halfHeight + r],
            ["L", r, halfHeight - r],
            ["A", r, r, 0, 0, 1, -r, halfHeight - r],
            ["L", -r, -halfHeight + r]
        ]);

        this.path.setWidth(finalSize.width);
        this.path.setHeight(finalSize.height);

        return finalSize;
    }
}