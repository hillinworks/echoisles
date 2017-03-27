import { TopLevelNode } from "./TopLevelNode";
import { BarLine } from "../../Core/MusicTheory/BarLine";
import { LiteralNode } from "./LiteralNode";
import { RhythmNode } from "./RhythmNode";
import { LyricsNode } from "./LyricsNode";
import { ILogger } from "../../Core/Logging/ILogger";
import { DocumentContext } from "../DocumentContext";
import { Bar } from "../../Core/Sheet/Bar";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { RhythmTemplate } from "../../Core/Sheet/RhythmTemplate";
import { Rhythm } from "../../Core/Sheet/Rhythm";
import { BarArranger } from "./BarArranger";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { BarColumn } from "../../Core/Sheet/BarColumn";
import { StrumTechnique } from "../../Core/MusicTheory/String/Plucked/StrumTechnique";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { IBeatElementContainer } from "../../Core/Sheet/IBeatElementContainer";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { LiteralParsers } from "../LiteralParsers";
import { TextRange } from "../../Core/Parsing/TextRange";
import { all, any } from "../../Core/Utilities/LinqLite";

function applyRhythmTemplate(template: RhythmTemplate, rhythm: Rhythm, logger: ILogger): Rhythm {

    const templateInstance = template.instantialize();

    if (rhythm === undefined) {
        return templateInstance;
    }

    if (rhythm.segments.length === 0) { // empty rhythm, should be filled with rest
        return rhythm;
    }

    if (any(rhythm.segments, s => s.firstVoice !== undefined)) { // rhythm already defined
        return rhythm;
    }

    function copyVoices(): void {
        for (let i = 0; i < templateInstance.segments.length; ++i) {
            rhythm.segments[i].trebleVoice = templateInstance.segments[i].trebleVoice;
            rhythm.segments[i].bassVoice = templateInstance.segments[i].bassVoice;
        }
    }

    if (rhythm.segments.length > templateInstance.segments.length) {
        logger.report(LogLevel.Warning, rhythm.range, Messages.Warning_TooManyChordsToMatchRhythmTemplate);
        copyVoices();
        for (let i = templateInstance.segments.length; i < rhythm.segments.length; ++i) {
            rhythm.segments[i].isOmittedByTemplate = true;
        }
    } else if (rhythm.segments.length < templateInstance.segments.length && rhythm.segments.length !== 1) {
        logger.report(LogLevel.Warning,
            rhythm.range,
            Messages.Warning_InsufficientChordsToMatchRhythmTemplate);

        const lastChord = rhythm.segments[rhythm.segments.length - 1].chord;
        copyVoices();

        for (let i = rhythm.segments.length; i < templateInstance.segments.length; ++i) {
            const segment = templateInstance.segments[i];
            segment.chord = lastChord;
            rhythm.segments.push(segment);
        }
    } else {
        copyVoices();
    }

    return rhythm;
}

function connectBars(previousBar: Bar, bar: Bar, voicePart: VoicePart): void {
    const voice = bar.getVoice(voicePart);
    const previousVoice = previousBar.getVoice(voicePart);
    const firstBeat = voice === undefined ? undefined : IBeatElementContainer.getFirstBeat(voice);
    const lastBeat = previousVoice === undefined ? undefined : IBeatElementContainer.getLastBeat(previousVoice);

    if (!firstBeat || !lastBeat) {
        return;
    }

    firstBeat.previousBeat = lastBeat;
    lastBeat.nextBeat = firstBeat;
}

export class BarNode extends TopLevelNode {
    openLine?: LiteralNode<BarLine.OpenType>;
    closeLine?: LiteralNode<BarLine.CloseType>;
    rhythm?: RhythmNode;
    lyrics?: LyricsNode;

    constructor(range?: TextRange) {
        super(range);
    }

    toDocumentElement(context: DocumentContext, logger: ILogger, template: Bar | undefined): Bar | undefined {
        const bar = new Bar();
        bar.range = this.range;
        bar.openLine = LiteralNode.valueOrUndefined(this.openLine);
        bar.closeLine = LiteralNode.valueOrUndefined(this.closeLine);

        const previousBar = context.currentBar;
        context.currentBar = bar;

        if (this.rhythm === undefined) {
            if (template !== undefined) {
                bar.rhythm = template.rhythm.clone();
            }
        } else {
            const result = this.rhythm.toDocumentElement(context, logger);
            if (!result) {
                return undefined;
            }

            bar.rhythm = result;
        }

        const tablatureState = context.documentState as TablatureState;
        bar.rhythm = applyRhythmTemplate(tablatureState.rhythmTemplate, bar.rhythm, logger);

        if (this.lyrics === undefined) {
            bar.lyrics = undefined;
        } else {
            const result = this.lyrics.toDocumentElement(context, logger);
            if (!result) {
                return undefined;
            }

            bar.lyrics = result;
        }

        new BarArranger(context, bar).arrange();

        for (let column of bar.columns) {
            if (!this.validateColumn(context, logger, column)) {
                return undefined;
            }
        }

        if (previousBar !== undefined) {
            connectBars(previousBar, bar, VoicePart.Treble);
            connectBars(previousBar, bar, VoicePart.Bass);
        }

        return bar;
    }

    private validateColumn(context: DocumentContext, logger: ILogger, column: BarColumn): boolean {
        if (column.voiceBeats.length === 2
            && all(column.voiceBeats, b => b.strumTechnique !== StrumTechnique.None)) {

            if (column.voiceBeats[0].strumTechnique !== column.voiceBeats[1].strumTechnique) {
                logger.report(LogLevel.Warning,
                    column.voiceBeats[1].range,
                    Messages.Warning_ConflictedStrumTechniques);

                column.voiceBeats[1].strumTechnique = StrumTechnique.None;
            }
        }

        return true;
    }
}


export module BarNode {

    export function parse(scanner: Scanner, inBraces: boolean): IParseResult<BarNode> {
        const anchor = scanner.makeAnchor();
        const node = new BarNode();

        node.openLine = LiteralParsers.readOpenBarLine(scanner).value;

        scanner.skipWhitespaces();

        let isLyricsRead = false;

        function isEndOfBlock(scanner: Scanner): boolean {
            return scanner.isEndOfInput || scanner.peekChar() === "+" || (inBraces && scanner.peekChar() === "}");
        }

        function isEndOfBar(scanner: Scanner): boolean {
            return isEndOfBlock(scanner) || scanner.peekChar() === "|" || scanner.peek(3) === ":||";
        }

        while (!isEndOfBlock(scanner)) {
            if (scanner.peekChar() === "@") {
                if (isLyricsRead) {
                    return ParseHelper.fail(scanner.lastReadRange, Messages.Error_UnexpectedLyrics);
                }

                const lyrics = LyricsNode.parse(scanner, isEndOfBar);
                if (ParseHelper.isSuccessful(lyrics)) {
                    isLyricsRead = true;
                    node.lyrics = lyrics.value;
                } else {
                    throw new Error("LyricsNode.parse should not return false");  // should not reach here
                }

                scanner.skipWhitespaces(false);
                continue;
            }

            const closeLine = LiteralParsers.readCloseBarLine(scanner);
            if (ParseHelper.isSuccessful(closeLine)) {
                node.closeLine = closeLine.value;
                break;
            }

            if (!isLyricsRead && node.rhythm === undefined) {
                const rhythm = RhythmNode.parse(scanner, isEndOfBar);
                if (ParseHelper.isSuccessful(rhythm)) {
                    node.rhythm = rhythm.value;
                    continue;
                }
            }

            break;
        }

        node.range = anchor.range;
        return ParseHelper.success(node);
    }

}