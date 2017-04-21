import { IChordFingering } from "../../Core/Sheet/Tablature/IChordFingering";
import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import {BarColumnChild} from "./BarColumnChild";
import {Size} from "../Size";
import {Style} from "../Style";
import {setPosition} from "./Utilities";

export abstract class NoteBase extends BarColumnChild {
    abstract get isHarmonics(): boolean;
    abstract get string(): number;
    abstract get ownerBeat(): CoreBeat;
    abstract get isObstructure(): boolean;
    protected abstract get symbolObject():fabric.Object;
    abstract matchesChord(fingering: IChordFingering): boolean;

    protected measureOverride(availableSize: Size): Size {
        const margin = Style.current.note.head.margin;
        return Size.fromSizeLike(this.symbolObject.getBoundingRect()).inflate(new Size(margin, margin));
    }

    protected arrangeOverride(finalSize: Size): Size {
        const margin = Style.current.note.head.margin;
        setPosition(this.symbolObject, this.position);
        return Size.fromSizeLike(this.symbolObject.getBoundingRect()).inflate(new Size(margin, margin));
    }
}