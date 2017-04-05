import { DocumentContext } from "../DocumentContext";
import { BeatNote } from "../../Core/Sheet/BeatNote";
import { BarLine } from "../../Core/MusicTheory/BarLine";
import { DocumentState } from "../../Core/Sheet/DocumentState";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";

export class TablatureContext extends DocumentContext {

    getLastNoteOnString(string: number): BeatNote | undefined {
        let note = this.currentVoice.lastNoteOnStrings[string];
        if (note) {
            return note;
        }

        if (!this.currentBar) {
            return undefined;
        }

        if (this.currentBar.openLine !== BarLine.BeginRepeat) {
            let bar = this.bars[this.bars.length - 1];
            while (bar) {
                if (bar.closeLine === BarLine.End
                    || bar.closeLine === BarLine.EndRepeat)
                    break;

                if (bar.openLine === BarLine.BeginRepeat)
                    break;

                const voice = bar.getVoice(this.currentVoice.part);

                if (voice.isTerminatedWithRest)
                    break;

                note = voice.lastNoteOnStrings[string];

                if (note)
                    return note;

                bar = bar.logicalPreviousBar;
            }
        }

        return undefined;
    }

    createDocumentState(): DocumentState {
        return new TablatureState();
    }

}