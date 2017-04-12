import { Document as CoreDocument } from "../Core/Sheet/Document";
import { Document } from "./DOM/Document";
import { Size } from "./Size";
import { Rect } from "./Rect";

export function render(document: CoreDocument, canvas: fabric.StaticCanvas): void {
    canvas.clear();
    const domDocument = new Document(document, canvas);
    domDocument.measure(new Size(760, 1560));
    domDocument.arrange(new Rect(20, 20, 760, 1560));
    canvas.renderAll();
}