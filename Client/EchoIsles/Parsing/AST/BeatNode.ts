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
import { Beat } from "../../Core/Sheet/Beat";
import { RhythmSegmentVoice } from "../../Core/Sheet/RhythmSegmentVoice";
import { Messages } from "../Messages";
import { BeatNoteNode } from "./BeatNoteNode";
import { Scanner } from "../Scanner";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper } from "../ParseResult";
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

    compile(context: DocumentContext, ownerVoice: RhythmSegmentVoice): ParseResult<Beat> {
        const helper = new ParseHelper();
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

        let validateResult = helper.absorb(this.validate(context, beat));
        if (!ParseHelper.isSuccessful(validateResult)) {
            return helper.fail();
        }

        for (let note of this.notes) {
            const result = helper.absorb(note.compile(context, ownerVoice.part));
            if (!ParseHelper.isSuccessful(result)) {
                return helper.fail();
            }

            const resultNote = result.value;
            resultNote.ownerBeat = beat;
            beat.notes.push(resultNote);
            ownerVoice.lastNoteOnStrings[resultNote.string] = resultNote;
        }

        ownerVoice.isTerminatedWithRest = beat.isRest;

        return helper.success(beat);
    }

    private validate(context: DocumentContext, beat: Beat): ParseResult<void> {
        const helper = new ParseHelper();

        if (beat.strumTechnique !== StrumTechnique.None
            && this.strumTechnique !== undefined) { // strum technique === undefined means we are derived from a template

            if (beat.isTied) {
                helper.warning(this.strumTechnique.range, Messages.Warning_StrumTechniqueForTiedBeat);
                beat.strumTechnique = StrumTechnique.None;
            } else if (beat.isRest) {
                helper.warning(this.strumTechnique.range, Messages.Warning_StrumTechniqueForRestBeat);
                beat.strumTechnique = StrumTechnique.None;
            }
        }

        return helper.success(undefined);
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

    function readNotes(scanner: Scanner): ParseResultMaybeEmpty<BeatNoteNode[]> {

        const helper = new ParseHelper();

        if (!scanner.expectChar("("))
            return helper.empty();

        const notes = new Array<BeatNoteNode>();

        scanner.skipWhitespaces();

        let parenthesisClosed = false;
        while (!scanner.isEndOfLine) {
            const note = helper.absorb(BeatNoteNode.parse(scanner));
            if (ParseHelper.isSuccessful(note)) {
                notes.push(note.value);
            } else {
                return helper.fail();
            }

            if (!scanner.skipOptional(",", true)) {
                if (scanner.expectChar(")")) {
                    parenthesisClosed = true;
                    break;
                }
            }
        }

        if (!parenthesisClosed) {
            return helper.fail(scanner.lastReadRange,
                Messages.Error_RhythmInstructionMissingCloseParenthesisInStringsSpecifier);
        }

        return helper.success(notes);
    }

    function readModifier(scanner: Scanner, node: BeatNode): ParseResult<void> {

        const helper = new ParseHelper();

        const accent = helper.absorb(LiteralParsers.readBeatAccent(scanner));
        if (ParseHelper.isSuccessful(accent)) {
            if (node.accent) {
                helper.warning(scanner.lastReadRange, Messages.Warning_BeatAccentAlreadySpecified);
            } else {
                node.accent = accent.value;
            }

            return helper.voidSuccess();
        }

        const ornament = helper.absorb(LiteralParsers.readOrnament(scanner));
        if (ParseHelper.isSuccessful(ornament)) {
            if (node.ornament) {
                helper.warning(scanner.lastReadRange, Messages.Warning_OrnamentAlreadySpecified);
            } else {
                node.ornament = ornament.value!.ornament;
                node.ornamentParameter = ornament.value!.parameter;
            }

            return helper.voidSuccess();
        }

        const noteRepetition = helper.absorb(LiteralParsers.readNoteRepetition(scanner));
        if (ParseHelper.isSuccessful(noteRepetition)) {
            if (node.noteRepetition) {
                helper.warning(scanner.lastReadRange, Messages.Warning_NoteRepetitionAlreadySpecified);
            } else {
                node.noteRepetition = noteRepetition.value;
            }

            return helper.voidSuccess();
        }

        const holdAndPause = helper.absorb(LiteralParsers.readHoldAndPause(scanner));
        if (ParseHelper.isSuccessful(holdAndPause)) {
            if (node.holdAndPause) {
                helper.warning(scanner.lastReadRange, Messages.Warning_BeatNoteHoldAndPauseEffectAlreadySpecified);
            } else {
                node.holdAndPause = holdAndPause.value;
            }

            return helper.voidSuccess();
        }

        const strumTechnique = helper.absorb(LiteralParsers.readStrumTechnique(scanner));
        if (ParseHelper.isSuccessful(strumTechnique)) {
            if (node.strumTechnique || node.chordStrumTechnique) {
                helper.warning(scanner.lastReadRange, Messages.Warning_BeatStrumTechniqueAlreadySpecified);
            } else {
                node.strumTechnique = strumTechnique.value;
            }

            return helper.voidSuccess();
        }

        return helper.fail(scanner.lastReadRange, Messages.Error_BeatModifierExpected);
    }


    export function parse(scanner: Scanner): ParseResult<BeatNode> {
        const anchor = scanner.makeAnchor();
        const helper = new ParseHelper();
        const node = new BeatNode();

        // read tie
        const tie = helper.absorb(LiteralParsers.readTie(scanner));
        if (ParseHelper.isSuccessful(tie)) {
            node.tie = tie.value.tie;
            node.tiePosition = tie.value!.tiePosition;
        }
        let isTied = !!node.tie;

        // read pre-connection
        const preConnection = helper.absorb(LiteralParsers.readPreBeatConnection(scanner));
        if (ParseHelper.isSuccessful(preConnection)) {
            if (isTied) {
                helper.warning(scanner.lastReadRange, Messages.Warning_PreConnectionInTiedBeat);
            } else {
                node.preConnection = preConnection.value;
            }
        }

        // read note value
        const noteValue = helper.absorb(NoteValueNode.parse(scanner));
        if (ParseHelper.isSuccessful(noteValue)) {
            node.noteValue = noteValue.value;
        } else if (ParseHelper.isFailed(noteValue)) {
            return helper.fail(); // todo: message?
        }

        const postNoteValueAnchor = scanner.makeAnchor();

        // read rest
        const rest = helper.absorb(ExistencyNode.parseCharExistency(scanner, "r"));
        if (ParseHelper.isSuccessful(rest)) {
            node.rest = rest.value;
        }

        scanner.skipWhitespaces();

        const postRestAnchor = scanner.makeAnchor();

        // read notes
        const readNotesResult = helper.absorb(readNotes(scanner));

        if (ParseHelper.isSuccessful(readNotesResult)) {
            node.notes.push(...readNotesResult.value);
        } else if (ParseHelper.isFailed(readNotesResult)) {
            return helper.fail();
        }

        // all notes are tied, which is equal to the beat being tied
        isTied = isTied || all(node.notes, n => !!n.tie);

        const noteValueIndetermined = !node.noteValue;

        // certain strum techniques (head strum techniques) can be placed before the colon token
        const chordStrumTechnique = helper.absorb(LiteralParsers.readChordStrumTechnique(scanner));

        if (ParseHelper.isSuccessful(chordStrumTechnique)) {
            node.chordStrumTechnique = chordStrumTechnique.value;
        } else {
            if (noteValueIndetermined && node.notes.length === 0) {
                return helper.fail(scanner.lastReadRange, Messages.Error_BeatBodyExpected);
            }
        }

        scanner.skipWhitespaces();

        // read modifiers
        if (scanner.expectChar(":")) {
            scanner.skipWhitespaces();

            do {
                const readModifierResult = helper.absorb(readModifier(scanner, node));
                if (!ParseHelper.isSuccessful(readModifierResult)) {
                    return helper.fail();
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
        const postBeatConnection = helper.absorb(LiteralParsers.readPostBeatConnection(scanner));
        if (ParseHelper.isSuccessful(postBeatConnection)) {
            node.postConnection = postBeatConnection.value;
        }

        // post-connection is not allowed for rest beat
        if (node.rest && node.hasRedundantSpecifierForRest) {
            helper.warning(postRestAnchor.range, Messages.Warning_RedundantModifiersInRestBeat);
        }

        node.range = anchor.range;
        return helper.success(node);
    }
}