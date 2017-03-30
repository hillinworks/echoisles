import { LyricsSegment as CoreLyricsSegment } from "../../Core/Sheet/LyricsSegment";
import { BarColumn } from "./BarColumn";

export class LyricsSegment extends BarColumn.Child {
    constructor(owner: BarColumn, readonly lyricsSegment: CoreLyricsSegment) {
        super(owner);
    }
}