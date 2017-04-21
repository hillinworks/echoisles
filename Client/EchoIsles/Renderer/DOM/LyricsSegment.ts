import { LyricsSegment as CoreLyricsSegment } from "../../Core/Sheet/LyricsSegment";
import { BarChild } from "./BarChild";
import { Bar } from "./Bar";

export class LyricsSegment extends BarChild {
    constructor(owner: Bar, readonly lyricsSegment: CoreLyricsSegment) {
        super(owner);
    }
}