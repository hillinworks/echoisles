import { Scanner } from "./Scanner";
import { LiteralNode } from "./AST/LiteralNode";
import { ExistencyNode } from "./AST/ExistencyNode";
import { BaseNoteValue } from "../Core/MusicTheory/BaseNoteValue";
import { Messages } from "./Messages";
import { NoteValueAugment } from "../Core/MusicTheory/NoteValueAugment";
import { BaseNoteName } from "../Core/MusicTheory/BaseNoteName";
import { Accidental } from "../Core/MusicTheory/Accidental";
import { StringUtilities } from "../Core/Utilities/StringUtilities";
import { StrumTechnique } from "../Core/MusicTheory/String/Plucked/StrumTechnique";
import { VerticalDirection } from "../Core/Style/VerticalDirection";
import { NoteConnection } from "../Core/MusicTheory/String/NoteConnection";
import { Ornament } from "../Core/MusicTheory/Ornament";
import { NoteRepetition } from "../Core/MusicTheory/NoteRepetition";
import { NoteEffectTechnique } from "../Core/MusicTheory/NoteEffectTechnique";
import { HoldAndPause } from "../Core/MusicTheory/HoldAndPause";
import { BeatAccent } from "../Core/MusicTheory/BeatAccent";
import { BarLine } from "../Core/MusicTheory/BarLine";
import { StaffType } from "../Core/MusicTheory/StaffType";
import { ParseResult, ParseResultMaybeEmpty, ParseHelper, ParseSuccessOrEmptyResult } from "./ParseResult";
import { LogMessage } from "../Core/Logging/LogMessage";

export module LiteralParsers {

    export function readInteger(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<number>> {
        const value = scanner.readInteger();
        if (value === undefined) {
            return ParseHelper.empty();
        }

        return ParseHelper.success(LiteralNode.create(value, scanner.lastReadRange));
    }

    export function readString(scanner: Scanner, pattern: string): ParseSuccessOrEmptyResult<LiteralNode<string>> {
        const value = scanner.readPattern(pattern);
        if (value === undefined) {
            return ParseHelper.empty();
        }

        return ParseHelper.success(LiteralNode.create(value, scanner.lastReadRange));
    }

    export function readChordName(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<string>> {
        return readString(scanner, "[a-zA-Z0-9][a-zA-Z0-9\\*\\$\\#♯♭\\-\\+\\?'\\`\\~\\&\\^\\!]*");
    }

    export function readBaseNoteValue(scanner: Scanner): ParseResult<LiteralNode<BaseNoteValue>> {
        const reciprocal = scanner.readInteger();
        if (reciprocal === undefined) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_NoteValueExpected);
        }

        const baseNoteValue = BaseNoteValue.parse(reciprocal);
        if (baseNoteValue === undefined) {
            return ParseHelper.fail(scanner.lastReadRange, Messages.Error_InvalidReciprocalNoteValue);
        }

        return ParseHelper.success(LiteralNode.create(baseNoteValue, scanner.lastReadRange));
    }

    export function readNoteValueAugment(scanner: Scanner): ParseResult<LiteralNode<NoteValueAugment>> {
        const anchor = scanner.makeAnchor();
        let dots = 0;
        while (!scanner.isEndOfLine) {
            if (!scanner.expectChar(".")) {
                break;
            }

            ++dots;
        }

        switch (dots) {
            case 0:
                return ParseHelper.success(LiteralNode.create(NoteValueAugment.None, anchor.range));
            case 1:
                return ParseHelper.success(LiteralNode.create(NoteValueAugment.Dot, anchor.range));
            case 2:
                return ParseHelper.success(LiteralNode.create(NoteValueAugment.TwoDots, anchor.range));
            case 3:
                return ParseHelper.success(LiteralNode.create(NoteValueAugment.ThreeDots, anchor.range));
            default:
                return ParseHelper.fail(anchor.range, Messages.Error_TooManyDotsInNoteValueAugment);
        }
    }

    export function readBaseNoteName(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<BaseNoteName>> {
        const noteNameChar = scanner.readChar();
        const baseNoteName = BaseNoteName.parse(noteNameChar);
        if (baseNoteName === undefined) {
            return ParseHelper.empty();
        }

        return ParseHelper.success(LiteralNode.create(baseNoteName, scanner.lastReadRange));
    }

    export function readAccidental(scanner: Scanner): ParseResultMaybeEmpty<LiteralNode<Accidental>> {
        const accidentalText = scanner.readAnyPatternOf("\\#\\#",
            "bb",
            "♯♯",
            "♭♭",
            "\\#",
            "♯",
            "b",
            "♭",
            StringUtilities.fixedFromCharCode(0x1d12a),
            StringUtilities.fixedFromCharCode(0x1d12b));

        if (accidentalText === undefined) {
            return ParseHelper.empty();
        }

        const accidental = Accidental.parse(accidentalText);
        if (accidental === undefined) {
            return ParseHelper.fail();
        }

        return ParseHelper.success(LiteralNode.create(accidental, scanner.lastReadRange));
    }

    export function readChordStrumTechnique(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<StrumTechnique.ChordType>> {
        switch (scanner.readAnyPatternOf("rasg", "ad", "au", "\\|", "x", "d", "↑", "u", "↓")) {
            case "|":
            case "x":
                return ParseHelper.success(LiteralNode
                    .create<StrumTechnique.ChordType>(StrumTechnique.None, scanner.lastReadRange));
            case "d":
            case "↑":
                return ParseHelper.success(LiteralNode
                    .create<StrumTechnique.ChordType>(StrumTechnique.BrushDown, scanner.lastReadRange));
            case "u":
            case "↓":
                return ParseHelper.success(LiteralNode
                    .create<StrumTechnique.ChordType>(StrumTechnique.BrushUp, scanner.lastReadRange));
            case "ad":
                return ParseHelper.success(LiteralNode
                    .create<StrumTechnique.ChordType>(StrumTechnique.ArpeggioDown, scanner.lastReadRange));
            case "au":
                return ParseHelper.success(LiteralNode
                    .create<StrumTechnique.ChordType>(StrumTechnique.ArpeggioUp, scanner.lastReadRange));
            case "rasg":
                return ParseHelper.success(LiteralNode
                    .create<StrumTechnique.ChordType>(StrumTechnique.Rasgueado, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readStrumTechnique(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<StrumTechnique>> {
        switch (scanner.readAnyPatternOf("rasg", "ad", "au", "pu", "pd", "d", "D", "↑", "u", "U", "↓")) {
            case "d":
            case "↑":
                return ParseHelper.success(LiteralNode.create(StrumTechnique.BrushDown, scanner.lastReadRange));
            case "u":
            case "↓":
                return ParseHelper.success(LiteralNode.create(StrumTechnique.BrushUp, scanner.lastReadRange));
            case "ad":
                return ParseHelper.success(LiteralNode.create(StrumTechnique.ArpeggioDown, scanner.lastReadRange));
            case "au":
                return ParseHelper.success(LiteralNode.create(StrumTechnique.ArpeggioUp, scanner.lastReadRange));
            case "rasg":
                return ParseHelper.success(LiteralNode.create(StrumTechnique.Rasgueado, scanner.lastReadRange));
            case "pu":
                return ParseHelper.success(LiteralNode.create(StrumTechnique.PickstrokeUp, scanner.lastReadRange));
            case "pd":
                return ParseHelper.success(LiteralNode.create(StrumTechnique.PickstrokeDown, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readTie(scanner: Scanner):
        ParseSuccessOrEmptyResult<{ tie: ExistencyNode, tiePosition?: LiteralNode<VerticalDirection> }> {

        switch (scanner.readAnyPatternOf("⁀", "‿", "~\\^", "~v", "~")) {
            case "~":
                return ParseHelper.success({ tie: new ExistencyNode(scanner.lastReadRange) });
            case "⁀":
            case "~^":
                return ParseHelper.success({
                    tie: new ExistencyNode(scanner.lastReadRange),
                    tiePosition: LiteralNode.create(VerticalDirection.Above, scanner.lastReadRange)
                });
            case "‿":
            case "~v":
                return ParseHelper.success({
                    tie: new ExistencyNode(scanner.lastReadRange),
                    tiePosition: LiteralNode.create(VerticalDirection.Under, scanner.lastReadRange)
                });
        }

        return ParseHelper.empty();
    }


    export function readPreBeatConnection(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<NoteConnection.PreBeatType>> {
        switch (scanner.readAnyPatternOf("\\.\\/", "\\`\\\\")) {
            case "./":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PreBeatType>(NoteConnection.SlideInFromLower, scanner.lastReadRange));
            case "`\\":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PreBeatType>(NoteConnection.SlideInFromHigher, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readPostBeatConnection(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<NoteConnection.PostBeatType>> {
        switch (scanner.readAnyPatternOf("\\/\\`", "\\\\\\.")) {
            case "/`":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PostBeatType>(NoteConnection.SlideOutToHigher, scanner.lastReadRange));
            case "`\\.":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PostBeatType>(NoteConnection.SlideOutToLower, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readPreNoteConnection(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<NoteConnection.PreNoteType>> {
        switch (scanner.readAnyPatternOf("\\/", "\\\\", "\\.\\/", "\\`\\\\", "h", "p", "s")) {
            case "/":
            case "\\":
            case "s":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PreNoteType>(NoteConnection.Slide, scanner.lastReadRange));
            case "./":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PreNoteType>(NoteConnection.SlideInFromLower, scanner.lastReadRange));
            case "`\\":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PreNoteType>(NoteConnection.SlideInFromHigher, scanner.lastReadRange));
            case "h":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PreNoteType>(NoteConnection.Hammer, scanner.lastReadRange));
            case "p":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PreNoteType>(NoteConnection.Pull, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readPostNoteConnection(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<NoteConnection.PostNoteType>> {
        switch (scanner.readAnyPatternOf("\\/\\`", "\\\\\\.")) {
            case "/`":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PostNoteType>(NoteConnection.SlideOutToHigher, scanner.lastReadRange));
            case "`\\.":
                return ParseHelper.success(LiteralNode
                    .create<NoteConnection.PostNoteType>(NoteConnection.SlideOutToLower, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readOrnament(scanner: Scanner): ParseSuccessOrEmptyResult<{ ornament: LiteralNode<Ornament>, parameter?: LiteralNode<number> }> {
        switch (scanner.readAnyPatternOf("trill", "tr")) {
            case "tr":
            case "trill":
                return ParseHelper.success({ ornament: LiteralNode.create(Ornament.Trill, scanner.lastReadRange) });
        }

        return ParseHelper.empty();
    }

    export function readNoteRepetition(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<NoteRepetition>> {
        switch (scanner.readAnyPatternOf("tremolo")) {
            case "tremolo":
                return ParseHelper.success(LiteralNode.create(NoteRepetition.Tremolo, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }


    export function readNoteEffectTechnique(scanner: Scanner): ParseSuccessOrEmptyResult<{ technique: LiteralNode<NoteEffectTechnique>, parameter?: LiteralNode<number> }> {
        switch (scanner.readAnyPatternOf("dead", "bend", "x", "b")) {
            case "dead":
            case "x":
                return ParseHelper.success({
                    technique: LiteralNode.create(NoteEffectTechnique.DeadNote, scanner.lastReadRange)
                });
            case "bend":
            case "b":
                // todo: bend args
                return ParseHelper.success({
                    technique: LiteralNode.create(NoteEffectTechnique.DeadNote, scanner.lastReadRange)
                });
        };

        return ParseHelper.empty();
    }

    export function readHoldAndPause(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<HoldAndPause>> {
        switch (scanner.readAnyPatternOf("fermata", "staccato", "tenuto")) {
            case "fermata":
                return ParseHelper.success(LiteralNode.create(HoldAndPause.Fermata, scanner.lastReadRange));
            case "staccato":
                return ParseHelper.success(LiteralNode.create(HoldAndPause.Staccato, scanner.lastReadRange));
            case "tenuto":
                return ParseHelper.success(LiteralNode.create(HoldAndPause.Tenuto, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readBeatAccent(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<BeatAccent>> {
        switch (scanner.readAnyPatternOf("accented", "heavy", "marcato")) {
            case "accented":
                return ParseHelper.success(LiteralNode.create(BeatAccent.Accented, scanner.lastReadRange));
            case "heavy":
            case "marcato":
                return ParseHelper.success(LiteralNode.create(BeatAccent.Marcato, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readOpenBarLine(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<BarLine.OpenType>> {
        if (scanner.expect("||:")) {
            return ParseHelper.success(LiteralNode
                .create<BarLine.OpenType>(BarLine.BeginRepeat, scanner.lastReadRange));
        }

        if (scanner.expect("||")) {
            return ParseHelper.empty(LogMessage.warning(scanner.lastReadRange, Messages.Warning_DoubleBarLineCannotBeOpenLine));
        }

        if (scanner.expectChar("|")) {
            return ParseHelper.success(LiteralNode.create<BarLine.OpenType>(BarLine.Standard, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readCloseBarLine(scanner: Scanner): ParseSuccessOrEmptyResult<LiteralNode<BarLine.CloseType>> {
        if (scanner.expect(":||")) {
            return ParseHelper.success(LiteralNode.create<BarLine.CloseType>(BarLine.EndRepeat, scanner.lastReadRange));
        }

        if (scanner.expect("||")) {
            return ParseHelper.success(LiteralNode.create<BarLine.CloseType>(BarLine.Double, scanner.lastReadRange));
        }

        if (scanner.expectChar("|")) {
            return ParseHelper.success(LiteralNode.create<BarLine.CloseType>(BarLine.Standard, scanner.lastReadRange));
        }

        return ParseHelper.empty();
    }

    export function readStaffType(scanner: Scanner): ParseResult<LiteralNode<StaffType>> {

        switch (scanner.readToLineEnd().trim().toLowerCase()) {
            case "guitar":
            case "acoustic guitar":
                return ParseHelper.success(LiteralNode.create(StaffType.Guitar, scanner.lastReadRange));
            case "steel":
            case "steel guitar":
                return ParseHelper.success(LiteralNode.create(StaffType.SteelGuitar, scanner.lastReadRange));
            case "nylon":
            case "nylon guitar":
            case "classical":
            case "classical guitar":
                return ParseHelper.success(LiteralNode.create(StaffType.NylonGuitar, scanner.lastReadRange));
            case "electric guitar":
                return ParseHelper.success(LiteralNode.create(StaffType.ElectricGuitar, scanner.lastReadRange));
            case "bass":
                return ParseHelper.success(LiteralNode.create(StaffType.Bass, scanner.lastReadRange));
            case "acoustic bass":
                return ParseHelper.success(LiteralNode.create(StaffType.AcousticBass, scanner.lastReadRange));
            case "electric bass":
                return ParseHelper.success(LiteralNode.create(StaffType.ElectricBass, scanner.lastReadRange));
            case "ukulele":
            case "uku":
                return ParseHelper.success(LiteralNode.create(StaffType.Ukulele, scanner.lastReadRange));
            case "mandolin":
                return ParseHelper.success(LiteralNode.create(StaffType.Mandolin, scanner.lastReadRange));
            case "vocal":
                return ParseHelper.success(LiteralNode.create(StaffType.Vocal, scanner.lastReadRange));
        }

        return ParseHelper.fail();
    }

}