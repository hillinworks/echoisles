import { Node } from "./Node";
import { LiteralNode } from "./LiteralNode";
import { ExistencyNode } from "./ExistencyNode";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { NoteConnection } from "../../Core/MusicTheory/String/NoteConnection";
import { NoteEffectTechnique } from "../../Core/MusicTheory/NoteEffectTechnique";
import { NoteAccent } from "../../Core/MusicTheory/NoteAccent";
import { TablatureContext } from "../Tablature/TablatureContext";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { BeatNote } from "../../Core/Sheet/BeatNote";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { DocumentContext } from "../DocumentContext";
import { Scanner } from "../Scanner";
import { ParseResult, ParseHelper } from "../ParseResult";
import { LiteralParsers } from "../LiteralParsers";
import { TextRange } from "../../Core/Parsing/TextRange";

export class BeatNoteNode extends Node {

    string: LiteralNode<number>;
    fret: LiteralNode<number>;
    tie?: ExistencyNode;
    tiePosition?: LiteralNode<VerticalDirection>;
    preConnection?: LiteralNode<NoteConnection.PreNoteType>;
    postConnection?: LiteralNode<NoteConnection.PostNoteType>;
    effectTechnique?: LiteralNode<NoteEffectTechnique>;
    effectTechniqueParameter?: LiteralNode<number>;
    accent?: LiteralNode<NoteAccent>;

    constructor(range?: TextRange) {
        super(range);
    }

    compile(context: DocumentContext, voicePart: VoicePart): ParseResult<BeatNote> {

        const helper = new ParseHelper();

        const tablatureState = context.documentState as TablatureState; // todo: refactor
        if (this.fret !== undefined
            && this.fret.value + tablatureState.minimumCapoFret < (tablatureState.getCapoFretOffset(this.string.value - 1))) {
            helper.warning(this.fret.range,
                Messages.Warning_FretUnderCapo,
                this.string.value,
                this.fret.value);
        }
        const element = new BeatNote();
        element.range = this.range;
        element.preConnection = LiteralNode.valueOrDefault(this.preConnection, NoteConnection.None);
        element.postConnection = LiteralNode.valueOrDefault(this.postConnection, NoteConnection.None);
        element.isTied = this.tie != null;
        element.tiePosition = LiteralNode.valueOrUndefined(this.tiePosition);
        element.string = this.string.value - 1;
        element.fret = LiteralNode.valueOrDefault(this.fret, BeatNote.unspecifiedFret);
        element.effectTechnique = LiteralNode.valueOrDefault(this.effectTechnique, NoteEffectTechnique.None);
        element.effectTechniqueParameter = LiteralNode.valueOrUndefined(this.effectTechniqueParameter);
        element.accent = LiteralNode.valueOrDefault(this.accent, NoteAccent.Normal);

        const validateResult = helper.absorb(this.validate(context, voicePart, element));
        if (!ParseHelper.isSuccessful(validateResult))
            return helper.fail();

        return helper.success(element);
    }

    private validate(context: DocumentContext, voicePart: VoicePart, element: BeatNote): ParseResult<void> {
        const helper = new ParseHelper();

        if (!ParseHelper.isSuccessful(helper.absorb(this.validateTie(context, element))))
            return helper.fail();

        if (!ParseHelper.isSuccessful(helper.absorb(this.validatePreConnection(context, voicePart, element))))
            return helper.fail();

        if (!ParseHelper.isSuccessful(helper.absorb(this.validatePostConnection(context, voicePart, element))))
            return helper.fail();

        return helper.voidSuccess();
    }

    private validateTie(context: DocumentContext, element: BeatNote): ParseResult<void> {

        const helper = new ParseHelper();

        if (this.tie === undefined) {
            return helper.success(undefined);
        }

        if (!ParseHelper.isSuccessful(helper.absorb(this.retrievePreConnectedNote(context, element)))) {
            return helper.fail();
        }

        if (this.fret === undefined) {
            element.fret = element.preConnectedNote.fret;
        } else if (this.fret.value !== element.preConnectedNote.fret) {
            helper.warning(this.fret.range, Messages.Warning_TiedNoteMismatch);
            element.preConnection = NoteConnection.None;
        }

        return helper.success(undefined);
    }

    private retrievePreConnectedNote(context: DocumentContext, element: BeatNote): ParseResult<void> {
        const tablatureContext = context as TablatureContext;
        const lastNote = tablatureContext.getLastNoteOnString(this.string.value - 1);

        if (lastNote === undefined) {
            return ParseHelper.fail(this.preConnection!.range, Messages.Error_ConnectionPredecessorNotExisted);
        }

        element.preConnectedNote = lastNote;
        return ParseHelper.voidSuccess;
    }

    private validatePreConnection(context: DocumentContext,
        voicePart: VoicePart,
        element: BeatNote): ParseResult<void> {

        const helper = new ParseHelper();

        if (this.preConnection === undefined || this.preConnection.value === NoteConnection.None)
            return helper.success(undefined);

        let tablatureState = context.documentState as TablatureState;

        if (this.preConnection.value === NoteConnection.SlideInFromHigher
            || this.preConnection.value === NoteConnection.SlideInFromLower) {
            if (this.fret === undefined) {
                helper.fail(this.preConnection.range, Messages.Error_FretMissingForSlideInNote);
            }

            if (this.preConnection.value === NoteConnection.SlideInFromLower
                && this.fret.value <= tablatureState.getCapoFretOffset(this.string.value - 1)) {
                helper.warning(this.fret.range, Messages.Warning_FretTooLowForSlideInNote);

                element.preConnection = NoteConnection.None;
            }

            return helper.success(undefined);
        }

        if (!ParseHelper.isSuccessful(helper.absorb(this.retrievePreConnectedNote(context, element)))) {
            return helper.fail();
        }

        switch (this.preConnection.value) {
            case NoteConnection.Slide:
                if (this.fret === undefined) {
                    helper.fail(this.preConnection.range,
                        Messages.Error_FretMissingForSlideNote);
                }
                if (this.fret.value === element.preConnectedNote.fret) {
                    helper.warning(this.preConnection.range,
                        Messages.Warning_SlidingToSameFret);
                    element.preConnection = NoteConnection.None;
                }
                return helper.success(undefined);
            case NoteConnection.Hammer:
                if (this.fret === undefined) {
                    helper.fail(this.preConnection.range,
                        Messages.Error_FretMissingForHammerNote);
                }

                if (this.fret.value === element.preConnectedNote.fret) {
                    helper.warning(this.fret.range,
                        Messages.Warning_HammeringToSameFret);
                    element.preConnection = NoteConnection.None;
                } else if (this.fret.value < element.preConnectedNote.fret) {
                    helper.warning(this.fret.range,
                        Messages.Warning_HammeringFromHigherFret);
                    element.preConnection = NoteConnection.Pull;
                }
                return helper.success(undefined);
            case NoteConnection.Pull:
                if (this.fret === undefined) {
                    return helper.fail(this.preConnection.range, Messages.Error_FretMissingForPullNote);
                }

                if (this.fret.value === element.preConnectedNote.fret) {
                    helper.warning(this.fret.range, Messages.Warning_PullingToSameFret);
                    element.preConnection = NoteConnection.None;
                } else if (this.fret.value > element.preConnectedNote.fret) {
                    helper.warning(this.fret.range, Messages.Warning_PullingFromLowerFret);
                    element.preConnection = NoteConnection.Hammer;
                }
                return helper.success(undefined);
            default:
                throw new RangeError();
        }
    }

    private validatePostConnection(context: DocumentContext,
        voicePart: VoicePart,
        element: BeatNote): ParseResult<void> {

        const helper = new ParseHelper();

        if (this.postConnection === undefined || this.postConnection.value === NoteConnection.None) {
            return helper.success(undefined);
        }


        const tablatureState = context.documentState as TablatureState;

        if (this.postConnection.value === NoteConnection.SlideOutToHigher
            || this.postConnection.value === NoteConnection.SlideOutToLower) {
            if (this.fret === undefined) {
                return helper.fail(this.preConnection!.range, Messages.Error_FretMissingForSlideOutNote);
            }

            if (this.postConnection.value === NoteConnection.SlideOutToLower
                && this.fret.value <= tablatureState.getCapoFretOffset(this.string.value - 1)) {
                helper.warning(this.fret.range, Messages.Warning_FretTooLowForSlideOutNote);
                element.postConnection = NoteConnection.None;
            }
        }

        return helper.success(undefined);
    }

    valueEquals(other: BeatNote): boolean {
        if (other === undefined)
            return false;

        if (this.string.value - 1 !== other.string)
            return false;

        if (LiteralNode.valueOrDefault(this.fret, BeatNote.unspecifiedFret) !== other.fret)
            return false;

        if (LiteralNode.valueOrDefault(this.effectTechnique, NoteEffectTechnique.None) !== other.effectTechnique)
            return false;

        if (LiteralNode.valueOrUndefined(this.effectTechniqueParameter) !== other.effectTechniqueParameter)
            return false;

        if (LiteralNode.valueOrDefault(this.accent, NoteAccent.Normal) !== other.accent)
            return false;

        if ((this.tie != null) !== other.isTied)
            return false;

        if (LiteralNode.valueOrUndefined(this.tiePosition) !== other.tiePosition)
            return false;

        if (LiteralNode.valueOrDefault(this.preConnection, NoteConnection.None) !== other.preConnection)
            return false;

        if (LiteralNode.valueOrDefault(this.postConnection, NoteConnection.None) !== other.postConnection)
            return false;

        return true;
    }

}

export module BeatNoteNode {
    export function parse(scanner: Scanner): ParseResult<BeatNoteNode> {
        const anchor = scanner.makeAnchor();
        const helper = new ParseHelper();
        const node = new BeatNoteNode();

        // read tie
        const tie = helper.absorb(LiteralParsers.readTie(scanner));
        if (ParseHelper.isSuccessful(tie)) {
            node.tie = tie.value.tie;
            node.tiePosition = tie.value.tiePosition;
        }
        const isTied = !!node.tie;

        // read pre-connection
        const preConnection = helper.absorb(LiteralParsers.readPreNoteConnection(scanner));
        if (ParseHelper.isSuccessful(preConnection)) {
            if (isTied) {
                helper.warning(scanner.lastReadRange, Messages.Warning_PreConnectionInTiedNote);
            } else {
                node.preConnection = preConnection.value;
            }
        }

        // read ghost note
        let ghostNoteAnchor = scanner.makeAnchor();
        let ghostNoteOpened = scanner.expectChar("(");

        // read string number
        const string = helper.absorb(LiteralParsers.readInteger(scanner));
        if (!ParseHelper.isSuccessful(string)) {
            return helper.fail(scanner.lastReadRange, Messages.Error_InvalidStringNumberInStringsSpecifier);
        }
        node.string = string.value!;

        // start reading fret
        if (scanner.expectChar("=")) {
            // read alternative ghost note
            if (!ghostNoteOpened && scanner.expectChar("(")) {
                ghostNoteOpened = true;
                ghostNoteAnchor = scanner.makeAnchor();
            }

            // read natural harmonic
            const naturalHarmonicAnchor = scanner.makeAnchor();
            const naturalHarmonicOpened = scanner.expectChar("<");

            // read fret number
            const fret = LiteralParsers.readInteger(scanner);
            if (!ParseHelper.isSuccessful(fret)) {
                return helper.fail(scanner.lastReadRange, Messages.Error_InvalidFretNumberInStringsSpecifier);
            }
            node.fret = fret.value!;

            // enclose natural harmonic
            if (naturalHarmonicOpened) {
                if (!scanner.expectChar(">")) {
                    return helper.fail(scanner.lastReadRange, Messages.Error_NaturalHarmonicNoteNotEnclosed);
                }
            }

            node.effectTechnique
                = new LiteralNode<NoteEffectTechnique>(NoteEffectTechnique.NaturalHarmonic, naturalHarmonicAnchor.range);

            // read artificial harmonic

            var artificialHarmonicAnchor = scanner.makeAnchor();
            if (scanner.expectChar("<")) {
                // read artificial harmonic fret number
                const artificialHarmonicFret = helper.absorb(LiteralParsers.readInteger(scanner));// empty fret number is allowed (defaulted to 12th higher)

                if (ParseHelper.isSuccessful(artificialHarmonicFret) && artificialHarmonicFret!.value!.value < node.fret.value) {
                    helper.warning(naturalHarmonicAnchor.range, Messages.Warning_ArtificialHarmonicFretTooSmall);
                }

                // enclose artificial harmonic
                if (!scanner.expectChar(">")) {
                    return helper.fail(scanner.lastReadRange, Messages.Error_ArtificialHarmonicFretSpecifierNotEnclosed);
                }

                if (naturalHarmonicOpened) {
                    helper.warning(naturalHarmonicAnchor.range, Messages.Warning_BothNaturalAndArtificialHarmonicDeclared);
                }

                node.effectTechnique
                    = new LiteralNode<NoteEffectTechnique>(NoteEffectTechnique.ArtificialHarmonic, artificialHarmonicAnchor.range);
                node.effectTechniqueParameter = ParseHelper.isSuccessful(artificialHarmonicFret)
                    ? new LiteralNode<number>(artificialHarmonicFret.value.value, artificialHarmonicFret.value.range)
                    : undefined;
            }
        }

        // enclose ghost note
        if (ghostNoteOpened) {
            if (!scanner.expectChar(")")) {
                return helper.fail(scanner.lastReadRange, Messages.Error_GhostNoteNotEnclosed);
            }
            node.accent = new LiteralNode<NoteAccent>(NoteAccent.Ghost, ghostNoteAnchor.range);
        }

        // read effect techniques
        scanner.skipWhitespaces();
        if (scanner.expectChar(":")) {
            if (isTied) {
                this.Report(LogLevel.Warning, scanner.lastReadRange,
                    Messages.Warning_EffectTechniqueInTiedNote);
            }

            const noteEffectTechnique = helper.absorb(LiteralParsers.readNoteEffectTechnique(scanner));
            if (ParseHelper.isSuccessful(noteEffectTechnique)) {
                node.effectTechnique = noteEffectTechnique.value!.technique;
                node.effectTechniqueParameter = noteEffectTechnique.value!.parameter;
            }
        }

        // read post-connection
        scanner.skipWhitespaces();
        const postNoteConnection = helper.absorb(LiteralParsers.readPostNoteConnection(scanner));
        if (ParseHelper.isSuccessful(postNoteConnection)) {
            node.postConnection = postNoteConnection.value;
        }

        node.range = anchor.range;

        return helper.success(node);
    }
}