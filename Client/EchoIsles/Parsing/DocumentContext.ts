import { DocumentState } from "../Core/Sheet/DocumentState";
import { Bar } from "../Core/Sheet/Bar";
import { RhythmSegmentVoice } from "../Core/Sheet/RhythmSegmentVoice";
import { Document } from "../Core/Sheet/Document";

export class DocumentContext {
    private _documentState: DocumentState = this.createDocumentState();
    readonly bars = new Array<Bar>();
    currentBar?: Bar;
    currentVoice: RhythmSegmentVoice;

    get documentState(): DocumentState {
        return this._documentState;
    }

    createDocumentState(): DocumentState {
        return new DocumentState();
    }

    addBar(bar: Bar) {
        if (!this.documentState.barAppeared) {
            this.alterDocumentState(s => s.barAppeared = true);
        }

        bar.index = this.bars.length;
        bar.documentState = this.documentState;

        const lastBar = this.bars[this.bars.length - 1];
        bar.previousBar = lastBar;
        if (lastBar) {
            lastBar.nextBar = bar;
        }

        bar.logicalPreviousBar = lastBar;   // todo: handle alternation

        this.bars.push(bar);
    }

    alterDocumentState(action: (state: DocumentState) => void): void {
        this._documentState = this.documentState.cloneAsUnsealed();
        action(this._documentState);
        this._documentState.seal();
    }

    toDocument(): Document {
        const document = new Document();
        document.bars = this.bars;
        document.documentState = this.documentState;
        return document;
    };


}