import { DocumentState } from "../DocumentState";
import { SealableCollection } from "../../Utilities/SealableCollection";
import { Capo } from "./Capo";
import { ChordDefinition } from "./ChordDefinition";
import { TuningSignature } from "../TuningSignature";
import { RhythmTemplate } from "../RhythmTemplate";
import { min, firstOrUndefined } from "../../Utilities/LinqLite";
import { ChordLibrary } from "./ChordLibrary";
import { IChordDefinition } from "./IChordDefinition";
import { Chord } from "./Chord";
import { InlineChordDefinition } from "./InlineChordDefinition";

export class TablatureState extends DocumentState {

    readonly capos = new SealableCollection<Capo>();
    private _capoFretOffsets: number[];
    private _minimumCapoFret: number;
    private chordLibrary?: ChordLibrary;

    readonly definedChords = new SealableCollection<ChordDefinition>();

    private _tuningSignature: TuningSignature;
    private _rhythmTemplate: RhythmTemplate;

    get capoFretOffsets(): number[] {
        return this._capoFretOffsets;
    }

    set capoFretOffsets(value: number[]) {
        this.checkSealed();
        this._capoFretOffsets = value;
        this._minimumCapoFret = min(value);
    }

    get minimumCapoFret(): number {
        return this._minimumCapoFret;
    }

    get tuningSignature(): TuningSignature {
        return this._tuningSignature;
    }

    set tuningSignature(value: TuningSignature) {
        this.checkSealed();
        this._tuningSignature = value;
    }

    get rhythmTemplate(): RhythmTemplate {
        return this._rhythmTemplate;
    }

    set rhythmTemplate(value: RhythmTemplate) {
        this.checkSealed();
        this._rhythmTemplate = value;
    }

    loadChordLibrary(chordLibrary: ChordLibrary) {
        this.chordLibrary = chordLibrary;
    }

    resolveChord(chord: Chord): IChordDefinition | undefined {
        if (chord.fingering) {
            return new InlineChordDefinition(chord);
        }

        if (!chord.name) {
            return undefined;
        }

        const upperChordName = chord.name.toUpperCase();
        const definition = firstOrUndefined(this.definedChords, c => c.name.toUpperCase() === upperChordName);
        if (definition) {
            return definition;
        }

        if (this.chordLibrary) {
            return this.chordLibrary.resolve(chord.name);
        }

        return undefined;
    }

    getCapoFretOffset(string: number): number {
        return this._capoFretOffsets === undefined ? 0 : this._capoFretOffsets[string];
    }

    seal(): void {
        super.seal();
        this.capos.seal();
        this.definedChords.seal();
    }

    protected instantializeClone(): DocumentState {
        return new TablatureState();
    }

    protected cloneProperties(state: DocumentState) {
        super.cloneProperties(state);
        const tablatureState = state as TablatureState;
        tablatureState.capos.appendClone(this.capos);
        if (this._capoFretOffsets) {
            tablatureState._capoFretOffsets = [...this._capoFretOffsets];
        }
        tablatureState._minimumCapoFret = this._minimumCapoFret;
        tablatureState.definedChords.appendClone(this.definedChords);
        tablatureState._tuningSignature = this._tuningSignature;
        tablatureState._rhythmTemplate = this._rhythmTemplate;
        tablatureState.chordLibrary = this.chordLibrary;
    }
}