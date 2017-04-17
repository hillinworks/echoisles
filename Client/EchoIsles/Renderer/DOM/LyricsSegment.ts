import { LyricsSegment as CoreLyricsSegment } from "../../Core/Sheet/LyricsSegment";
import { BarColumn } from "./BarColumn";
import { BarColumnChild } from "./BarColumnChild";

export class LyricsSegment extends BarColumnChild {
    constructor(owner: BarColumn, readonly lyricsSegment: CoreLyricsSegment) {
        super(owner);
    }
}