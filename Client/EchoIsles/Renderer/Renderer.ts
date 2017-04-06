import { Document as CoreDocument } from "../Core/Sheet/Document";
import { Document } from "./DOM/Document";
import { Size } from "./Size";
import { Rect } from "./Rect";

export function render(document: CoreDocument, canvas: fabric.Canvas): void {
    const domDocument = new Document(document, canvas);
    domDocument.measure(new Size(1200, 1600));
    domDocument.arrange(new Rect(0, 0, 1200, 1600));
}