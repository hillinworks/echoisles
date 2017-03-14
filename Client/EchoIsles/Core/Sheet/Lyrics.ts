import { Element } from "./Element"
import { LyricsSegment } from "./LyricsSegment";

export class Lyrics extends Element {
    readonly segments = new Array<LyricsSegment>();
}