import { Beat as CoreBeat } from "../../Core/Sheet/Beat";
import { BarColumn } from "./BarColumn";
import { NoteBase } from "./NoteBase";
import { IChordFingering } from "../../Core/Sheet/Tablature/IChordFingering";
import { makeStyle, font, centerAlign } from "./Utilities";
import { Style } from "../Style";
import { Smufl } from "../Smufl/Smufl";

export class Rest extends NoteBase {

    private restSymbol: fabric.Text;

    constructor(parent: BarColumn, readonly ownerBeat: CoreBeat, readonly string: number) {
        super(parent);
        this.initializeComponents();
    }

    get isHarmonics(): boolean {
        return false;
    }

    get isObstructure(): boolean {
        return false;
    }

    protected get symbolObject(): fabric.Object {
        return this.restSymbol;
    }

    private initializeComponents() {
        this.restSymbol = new fabric.Text(Smufl.GetRest(this.ownerBeat.noteValue.base),
            makeStyle(font(Style.current.note.restSize), centerAlign(true)));

        if (this.root) {
            this.root.canvas.add(this.restSymbol);
        }
    }

    matchesChord(fingering: IChordFingering): boolean {
        return true;
    }

    destroy(): void {
        if (this.root) {
            this.root.canvas.remove(this.restSymbol);
        }
    }
}