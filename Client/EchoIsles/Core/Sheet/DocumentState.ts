import { Alternation } from "./Alternation";
import { AlternationText } from "../MusicTheory/AlternationText";
import { Section } from "./Section";
import { Explicity } from "../Explicity";
import { SealableCollection } from "../Utilities/SealableCollection";
import { KeySignature } from "./KeySignature";
import { TimeSignature } from "./TimeSignature";
import { TempoSignature } from "./TempoSignature";
import { Time } from "../MusicTheory/Time";
import { Defaults } from "./Defaults";

export class DocumentState {
    private _currentAlternation?: Alternation;
    private _alternationTextType: AlternationText.Type;
    private _alternationTextExplicity: Explicity;
    readonly definedAlternationIndices = new SealableCollection<number>();

    private _barAppeared: boolean;

    private _currentSection: Section;
    readonly definedSections = new SealableCollection<Section>();

    private _keySignature: KeySignature;
    private _timeSignature: TimeSignature;
    private _tempoSignature: TempoSignature;

    private _isSealed: boolean;


    get isSealed(): boolean {
        return this._isSealed;
    }

    get currentAlternation(): Alternation | undefined {
        return this._currentAlternation;
    }

    set currentAlternation(value: Alternation | undefined) {
        this.checkSealed();
        this._currentAlternation = value;
    }

    get alternationTextType(): AlternationText.Type {
        return this._alternationTextType;
    }

    set alternationTextType(value: AlternationText.Type) {
        this.checkSealed();
        this._alternationTextType = value;
    }

    get alternationTextExplicity(): Explicity {
        return this._alternationTextExplicity;
    }

    set alternationTextExplicity(value: Explicity) {
        this.checkSealed();
        this._alternationTextExplicity = value;
    }

    get currentSection(): Section {
        return this._currentSection;
    }

    set currentSection(value: Section) {
        this.checkSealed();
        this._currentSection = value;
    }

    get barAppeared(): boolean {
        return this._barAppeared;
    }

    set barAppeared(value: boolean) {
        this.checkSealed();
        this._barAppeared = value;
    }

    get keySignature(): KeySignature {
        return this._keySignature;
    }

    set keySignature(value: KeySignature) {
        this.checkSealed();
        this._keySignature = value;
    }

    get timeSignature(): TimeSignature {
        return this._timeSignature;
    }

    set timeSignature(value: TimeSignature) {
        this.checkSealed();
        this._timeSignature = value;
    }

    get tempoSignature(): TempoSignature {
        return this._tempoSignature;
    }

    set tempoSignature(value: TempoSignature) {
        this.checkSealed();
        this._tempoSignature = value;
    }

    get time(): Time {
        return this._timeSignature !== undefined ? this._timeSignature.time : Defaults.time;
    }

    seal(): void {
        this._isSealed = true;
        this.definedAlternationIndices.seal();
        this.definedSections.seal();
    }

    protected checkSealed(): void {
        if (this.isSealed)
            throw new Error("accessing a sealed document state");
    }

    protected cloneProperties(state: DocumentState) {
        state._currentAlternation = this._currentAlternation;
        state._alternationTextType = this._alternationTextType;
        state._alternationTextExplicity = this._alternationTextExplicity;
        state.definedAlternationIndices.appendClone(this.definedAlternationIndices);
        state._barAppeared = this._barAppeared;
        state._keySignature = this._keySignature;
        state._timeSignature = this._timeSignature;
        state._tempoSignature = this._tempoSignature;
        state._currentSection = this._currentSection;
        state.definedSections.appendClone(this.definedSections);
    }

    protected instantializeClone(): DocumentState {
        return new DocumentState();
    }

    cloneAsUnsealed(): DocumentState {
        const clone = this.instantializeClone();
        this.cloneProperties(clone);
        return clone;
    }
}