﻿import { DocumentState } from "../DocumentState";
import { SealableCollection } from "../../Utilities/SealableCollection";
import { Capo } from "./Capo";
import { ChordDefinition } from "./ChordDefinition";
import { TuningSignature } from "../TuningSignature";
import { RhythmTemplate } from "../RhythmTemplate";
import { min } from "../../Utilities/LinqLite";

export class TablatureState extends DocumentState {

    readonly capos = new SealableCollection<Capo>();
    private _capoFretOffsets: number[];
    private _minimumCapoFret: number;

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

    getCapoFretOffset(string: number): number {
        return this._capoFretOffsets === undefined ? 0 : this._capoFretOffsets[string];
    }

    seal(): void {
        super.seal();
        this.capos.seal();
        this.definedChords.seal();
    }

    protected cloneProperties(state: DocumentState) {
        super.cloneProperties(state);
        const tablatureState = state as TablatureState;
        tablatureState.capos.appendClone(this.capos);
        tablatureState._capoFretOffsets = [...this._capoFretOffsets];
        tablatureState._minimumCapoFret = this._minimumCapoFret;
        tablatureState.definedChords.appendClone(this.definedChords);
        tablatureState._tuningSignature = this._tuningSignature;
        tablatureState._rhythmTemplate = this._rhythmTemplate;
    }
}