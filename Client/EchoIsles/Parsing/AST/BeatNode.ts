import { Node } from "./Node";
import { NoteValueNode } from "./NoteValueNode";
import { ExistencyNode } from "./ExistencyNode";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { LiteralNode } from "./LiteralNode";
import { NoteConnection } from "../../Core/MusicTheory/String/NoteConnection";
import { StrumTechnique } from "../../Core/MusicTheory/String/Plucked/StrumTechnique";
import { Ornament } from "../../Core/MusicTheory/Ornament";
import { NoteRepetition } from "../../Core/MusicTheory/NoteRepetition";
import { HoldAndPause } from "../../Core/MusicTheory/HoldAndPause";
import { BeatAccent } from "../../Core/MusicTheory/BeatAccent";
import { DocumentContext } from "../DocumentContext";
import { ILogger } from "../../Core/Logging/ILogger";
import { Beat } from "../../Core/Sheet/Beat";
import { RhythmSegmentVoice } from "../../Core/Sheet/RhythmSegmentVoice";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { BeatNoteNode } from "./BeatNoteNode";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper, ParseResultType } from "../ParseResult";
import { LiteralParsers } from "../LiteralParsers";
import { TextRange } from "../../Core/Parsing/TextRange";
import { all } from "../../Core/Utilities/LinqLite";

export class BeatNode extends Node {
    noteValue: NoteValueNode;
    forceBeamStart?: ExistencyNode;
    forceBeamEnd?: ExistencyNode;
    rest?: ExistencyNode;
    tie?: ExistencyNode;
    tiePosition?: LiteralNode<VerticalDirection>;
    preConnection?: LiteralNode<NoteConnection.PreBeatType>;
    postConnection?: LiteralNode<NoteConnection.PostBeatType>;
    chordStrumTechnique?: LiteralNode<StrumTechnique.ChordType>;
    strumTechnique?: LiteralNode<StrumTechnique>;
    ornament?: LiteralNode<Ornament>;
    ornamentParameter?: LiteralNode<number>;
    noteRepetition?: LiteralNode<NoteRepetition>;
    holdAndPause?: LiteralNode<HoldAndPause>;
    accent?: LiteralNode<BeatAccent>;
    readonly notes = new Array<BeatNoteNode>();

    constructor(range?: TextRange) {
        super(range);
    }

    get hasRedundantSpecifierForRest(): boolean {
        return this.notes.length > 0
            || this.tie !== undefined
            || this.preConnection !== undefined
            || this.postConnection !== undefined
            || this.chordStrumTechnique !== undefined
            || this.strumTechnique !== undefined
            || this.ornament !== undefined
            || this.ornamentParameter !== undefined
            || this.noteRepetition !== undefined
            || this.holdAndPause !== undefined
            || this.accent !== undefined;
    }

    get hasRedunantSpecifierForTied(): boolean {
        return this.rest !== undefined
            || this.preConnection !== undefined
            || this.chordStrumTechnique !== undefined
            || this.notes.length > 0
            || this.strumTechnique !== undefined
            || this.ornament !== undefined
            || this.ornamentParameter !== undefined
            || this.noteRepetition !== undefined
            || this.holdAndPause !== undefined
            || this.accent !== undefined;
    }

    toDocumentElement(context: DocumentContext, logger: ILogger, ownerVoice: RhythmSegmentVoice): Beat | undefined {
        const beat = new Beat();
        beat.range = this.range;
        beat.strumTechnique = LiteralNode.valueOrDefault(this.strumTechnique,
            LiteralNode.valueOrDefault(this.chordStrumTechnique, StrumTechnique.None));
        beat.accent = LiteralNode.valueOrDefault(this.accent, BeatAccent.Normal);
        beat.holdAndPause = LiteralNode.valueOrDefault(this.holdAndPause, HoldAndPause.None);
        beat.ornament = LiteralNode.valueOrDefault(this.ornament, Ornament.None);
        beat.noteRepetition = LiteralNode.valueOrDefault(this.noteRepetition, NoteRepetition.None);
        beat.effectTechniqueParameter = LiteralNode.valueOrUndefined(this.ornamentParameter);
        beat.isRest = this.rest != null;
        beat.isTied = this.tie != null;
        beat.tiePosition = LiteralNode.valueOrUndefined(this.tiePosition);
        beat.preConnection = LiteralNode.valueOrDefault(this.preConnection, NoteConnection.None);
        beat.postConnection = LiteralNode.valueOrDefault(this.postConnection, NoteConnection.None);
        beat.noteValue = this.noteValue.toNoteValue();
        beat.voicePart = ownerVoice.part;
        beat.isForceBeamStart = this.forceBeamStart != null;
        beat.isForceBeamEnd = this.forceBeamEnd != null;

        if (!this.validate(context, logger, beat)) {
            return undefined;
        }

        for (let note of this.notes) {
            const result = note.toDocumentElement(context, logger, ownerVoice.part);
            if (!result) {
                return undefined;
            }

            result.ownerBeat = beat;
            beat.notes.push(result!);
            ownerVoice.lastNoteOnStrings[result.string] = result;
        }

        ownerVoice.isTerminatedWithRest = beat.isRest;

        return beat;
    }

    private validate(context: DocumentContext, logger: ILogger, beat: Beat): boolean {
        if (beat.strumTechnique !== StrumTechnique.None
            && this.strumTechnique !== undefined) { // strum technique === undefined means we are derived from a template

            if (beat.isTied) {
                logger.report(LogLevel.Warning, this.strumTechnique.range,
                    Messages.Warning_StrumTechniqueForTiedBeat);

                beat.strumTechnique = StrumTechnique.None;
            } else if (beat.isRest) {
                logger.report(LogLevel.Warning, this.strumTechnique.range,
                    Messages.Warning_StrumTechniqueForRestBeat);

                beat.strumTechnique = StrumTechnique.None;
            }
        }

        return true;
    }

    valueEquals(other: Beat): boolean {
        if (other === undefined) {
            return false;
        }

        if (this.chordStrumTechnique === undefined) {
            if (LiteralNode.valueOrDefault(this.strumTechnique, StrumTechnique.None) !== other.strumTechnique) {
                return false;
            }
        } else {
            const chordStrumTechnique = LiteralNode.valueOrDefault(this.chordStrumTechnique, StrumTechnique.None);
            if (chordStrumTechnique !== other.strumTechnique) {
                return false;
            }
        }

        if (this.noteValue.toNoteValue() !== other.noteValue) {
            return false;
        }

        if ((this.rest != null) !== other.isRest) {
            return false;
        }

        if ((this.tie != null) !== other.isTied) {
            return false;
        }

        if (LiteralNode.valueOrUndefined(this.tiePosition) !== other.tiePosition) {
            return false;
        }

        if (LiteralNode.valueOrDefault(this.preConnection, NoteConnection.None) !== other.preConnection) {
            return false;
        }

        if (LiteralNode.valueOrDefault(this.postConnection, NoteConnection.None) !== other.postConnection) {
            return false;
        }

        if (LiteralNode.valueOrDefault(this.ornament, Ornament.None) !== other.ornament) {
            return false;
        }

        if (LiteralNode.valueOrDefault(this.noteRepetition, NoteRepetition.None) !== other.noteRepetition) {
            return false;
        }

        if (LiteralNode.valueOrUndefined(this.ornamentParameter) !== other.effectTechniqueParameter) {
            return false;
        }

        if (LiteralNode.valueOrDefault(this.holdAndPause, HoldAndPause.None) !== other.holdAndPause) {
            return false;
        }

        if (LiteralNode.valueOrDefault(this.accent, BeatAccent.Normal) !== other.accent) {
            return false;
        }

        if (other.notes.length !== this.notes.length) {
            return false;
        }
        for (let i = 0; i < this.notes.length; ++i) {
            if (!this.notes[i].valueEquals(other.notes[i])) {
                return false;
            }
        }

        return true;
    }
}

export module BeatNode {

    function readNotes(scanner: Scanner): IParseResult<BeatNoteNode[]> {
        if (!scanner.expectChar("("))
            return ParseHelper.empty();

        const notes = new Array<BeatNoteNode>();

        scanner.skipWhitespaces();

        let parenthesisClosed = false;
        while (!scanner.isEndOfLine) {
            const note = BeatNoteNode.parse(scanner);
            if (!ParseHelper.isSuccessful(note)) {
                return ParseHelper.relayState(note);
            }

            notes.push(note.value!);

            if (!scanner.skipOptional(",", true)) {
                if (scanner.expectChar(")")) {
                    parenthesisClosed = true;
                    break;
                }
            }
        }

        if (!parenthesisClosed) {
            return ParseHelper.fail(scanner.lastReadRange,
                Messages.Error_RhythmInstructionMissingCloseParenthesisInStringsSpecifier);
        }

        return ParseHelper.success(notes);
    }

    function readModifier(scanner: Scanner, node: BeatNode): IParseResult<void> {

        const helper = new ParseHelper();

        const accent = LiteralParsers.readBeatAccent(scanner);
        if (ParseHelper.isSuccessful(accent)) {
            if (node.accent) {
                helper.warning(scanner.lastReadRange, Messages.Warning_BeatAccentAlreadySpecified);
            } else {
                node.accent = accent.value;
            }

            return helper.success<void>(undefined);
        }

        const ornament = LiteralParsers.readOrnament(scanner);
        if (ParseHelper.isSuccessful(ornament)) {
            if (node.ornament) {
                helper.warning(scanner.lastReadRange, Messages.Warning_OrnamentAlreadySpecified);
            } else {
                node.ornament = ornament.value!.ornament;
                node.ornamentParameter = ornament.value!.parameter;
            }

            return helper.success<void>(undefined);
        }

        const noteRepetition = LiteralParsers.readNoteRepetition(scanner);
        if (ParseHelper.isSuccessful(noteRepetition)) {
            if (node.noteRepetition) {
                helper.warning(scanner.lastReadRange, Messages.Warning_NoteRepetitionAlreadySpecified);
            } else {
                node.noteRepetition = noteRepetition.value;
            }

            return helper.success<void>(undefined);
        }

        const holdAndPause = LiteralParsers.readHoldAndPause(scanner);
        if (ParseHelper.isSuccessful(holdAndPause)) {
            if (node.holdAndPause) {
                helper.warning(scanner.lastReadRange, Messages.Warning_BeatNoteHoldAndPauseEffectAlreadySpecified);
            } else {
                node.holdAndPause = holdAndPause.value;
            }

            return helper.success<void>(undefined);
        }

        const strumTechnique = LiteralParsers.readStrumTechnique(scanner);
        if (ParseHelper.isSuccessful(strumTechnique)) {
            if (node.strumTechnique || node.chordStrumTechnique) {
                helper.warning(scanner.lastReadRange, Messages.Warning_BeatStrumTechniqueAlreadySpecified);
            } else {
                node.strumTechnique = strumTechnique.value;
            }

            return helper.success<void>(undefined);
        }

        return helper.fail(scanner.lastReadRange, Messages.Error_BeatModifierExpected);
    }


    export function parse(scanner: Scanner): IParseResult<BeatNode> {
        const anchor = scanner.makeAnchor();
        const helper = new ParseHelper();
        const node = new BeatNode();

        // read tie
        const tie = helper.absorb(LiteralParsers.readTie(scanner));
        if (ParseHelper.isSuccessful(tie)) {
            node.tie = tie.value!.tie;
            node.tiePosition = tie.value!.tiePosition;
        }
        let isTied = !!tie.value;

        // read pre-connection
        const preConnection = helper.absorb(LiteralParsers.readPreBeatConnection(scanner));
        if (isTied && ParseHelper.isSuccessful(preConnection)) {
            helper.warning(scanner.lastReadRange, Messages.Warning_PreConnectionInTiedBeat);
        } else {
            node.preConnection = preConnection.value;
        }

        // read note value
        const noteValue = NoteValueNode.parse(scanner);
        if (noteValue.result === ParseResultType.Failed) {
            return helper.fail(); // todo: message?
        }
        node.noteValue = noteValue.value!;

        const postNoteValueAnchor = scanner.makeAnchor();

        // read rest
        node.rest = helper.absorb(ExistencyNode.parseCharExistency(scanner, "r")).value;

        scanner.skipWhitespaces();

        const postRestAnchor = scanner.makeAnchor();

        // read notes
        const notes = readNotes(scanner);
        if (notes.result === ParseResultType.Failed) {
            return helper.relayFailure(notes);
        }

        if (notes.value) {
            node.notes.push(...notes.value);
        }

        // all notes are tied, which is equal to the beat being tied
        isTied = isTied || all(node.notes, n => !!n.tie);

        const noteValueIndetermined = !noteValue.value;

        // certain strum techniques (head strum techniques) can be placed before the colon token
        const chordStrumTechnique = LiteralParsers.readChordStrumTechnique(scanner);

        if (noteValueIndetermined && notes.value!.length === 0 && !ParseHelper.isSuccessful(chordStrumTechnique)) {
            return helper.fail(scanner.lastReadRange, Messages.Error_BeatBodyExpected);
        }

        node.chordStrumTechnique = chordStrumTechnique.value;

        scanner.skipWhitespaces();

        // read modifiers
        if (scanner.expectChar(":")) {
            scanner.skipWhitespaces();

            do {
                const modifier = readModifier(scanner, node);
                if (modifier.result === ParseResultType.Failed) {
                    return helper.relayFailure(modifier);
                }

                scanner.skipWhitespaces();
            } while (scanner.expectChar(","));
        }

        // post-connection is allowed for tied beat, so we check it here
        if (isTied && node.hasRedunantSpecifierForTied) {
            helper.hint(postNoteValueAnchor.range, Messages.Hint_RedundantModifiersInTiedBeat);
        }

        // read post-connection
        scanner.skipWhitespaces();

        node.postConnection = helper.absorb(LiteralParsers.readPostBeatConnection(scanner)).value;

        // post-connection is not allowed for rest beat
        if (node.rest && node.hasRedundantSpecifierForRest) {
            helper.warning(postRestAnchor.range, Messages.Warning_RedundantModifiersInRestBeat);
        }

        node.range = anchor.range;
        return helper.success(node);
    }
}