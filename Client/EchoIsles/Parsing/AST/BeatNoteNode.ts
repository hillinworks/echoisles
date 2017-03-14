import { Node } from "./Node";
import { LiteralNode } from "./LiteralNode";
import { ExistencyNode } from "./ExistencyNode";
import { VerticalDirection } from "../../Core/Style/VerticalDirection";
import { NoteConnection } from "../../Core/MusicTheory/String/NoteConnection";
import { NoteEffectTechnique } from "../../Core/MusicTheory/NoteEffectTechnique";
import { NoteAccent } from "../../Core/MusicTheory/NoteAccent";
import { ILogger } from "../../Core/Logging/ILogger";
import { TablatureContext } from "../Tablature/TablatureContext";
import { VoicePart } from "../../Core/Sheet/VoicePart";
import { BeatNote } from "../../Core/Sheet/BeatNote";
import { TablatureState } from "../../Core/Sheet/Tablature/TablatureState";
import { LogLevel } from "../../Core/Logging/LogLevel";
import { Messages } from "../Messages";
import { DocumentContext } from "../DocumentContext";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
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

    toDocumentElement(context: DocumentContext, logger: ILogger, voicePart: VoicePart): BeatNote | undefined {
        const tablatureState = context.documentState as TablatureState; // todo: refactor
        if (this.fret !== undefined
            && this.fret.value + tablatureState.minimumCapoFret < (tablatureState.getCapoFretOffset(this.string.value - 1))) {
            logger.report(LogLevel.Warning,
                this.fret.range,
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

        if (!this.validate(context, logger, voicePart, element))
            return undefined;

        return element;
    }

    private validate(context: DocumentContext, logger: ILogger, voicePart: VoicePart, element: BeatNote): boolean {
        if (!this.validateTie(context, logger, element))
            return false;

        if (!this.validatePreConnection(context, logger, voicePart, element))
            return false;

        if (!this.validatePostConnection(context, logger, voicePart, element))
            return false;
        return true;
    }

    private validateTie(context: DocumentContext, logger: ILogger, element: BeatNote): boolean {
        if (this.tie === undefined)
            return true;

        if (!this.retrievePreConnectedNote(context, logger, element))
            return false;

        if (this.fret === undefined)
            element.fret = element.preConnectedNote.fret;
        else if (this.fret.value !== element.preConnectedNote.fret) {
            logger.report(LogLevel.Warning,
                this.fret.range,
                Messages.Warning_TiedNoteMismatch);

            element.preConnection = NoteConnection.None;
        }

        return true;
    }

    private retrievePreConnectedNote(context: DocumentContext, logger: ILogger, element: BeatNote): boolean {
        const tablatureContext = context as TablatureContext;
        const lastNote = tablatureContext.getLastNoteOnString(this.string.value - 1);

        if (lastNote === undefined) {
            logger.report(LogLevel.Error,
                this.preConnection!.range,
                Messages.Error_ConnectionPredecessorNotExisted);

            return false;
        }

        element.preConnectedNote = lastNote;
        return true;
    }

    private validatePreConnection(context: DocumentContext,
        logger: ILogger,
        voicePart: VoicePart,
        element: BeatNote): boolean {

        if (this.preConnection === undefined || this.preConnection.value === NoteConnection.None)
            return true;

        let tablatureState = context.documentState as TablatureState;

        if (this.preConnection.value === NoteConnection.SlideInFromHigher
            || this.preConnection.value === NoteConnection.SlideInFromLower) {
            if (this.fret === undefined) {
                logger.report(LogLevel.Error,
                    this.preConnection.range,
                    Messages.Error_FretMissingForSlideInNote);

                return false;
            }

            if (this.preConnection.value === NoteConnection.SlideInFromLower
                && this.fret.value <= tablatureState.getCapoFretOffset(this.string.value - 1)) {
                logger.report(LogLevel.Warning,
                    this.fret.range,
                    Messages.Warning_FretTooLowForSlideInNote);

                element.preConnection = NoteConnection.None;
            }

            return true;
        }

        if (!this.retrievePreConnectedNote(context, logger, element))
            return false;

        switch (this.preConnection.value) {
            case NoteConnection.Slide:
                if (this.fret === undefined) {
                    logger.report(LogLevel.Error,
                        this.preConnection.range,
                        Messages.Error_FretMissingForSlideNote);
                    return false;
                }
                if (this.fret.value === element.preConnectedNote.fret) {
                    logger.report(LogLevel.Warning,
                        this.preConnection.range,
                        Messages.Warning_SlidingToSameFret);
                    element.preConnection = NoteConnection.None;
                }
                return true;
            case NoteConnection.Hammer:
                if (this.fret === undefined) {
                    logger.report(LogLevel.Error,
                        this.preConnection.range,
                        Messages.Error_FretMissingForHammerNote);
                    return false;
                }

                if (this.fret.value === element.preConnectedNote.fret) {
                    logger.report(LogLevel.Warning,
                        this.fret.range,
                        Messages.Warning_HammeringToSameFret);
                    element.preConnection = NoteConnection.None;
                } else if (this.fret.value < element.preConnectedNote.fret) {
                    logger.report(LogLevel.Warning,
                        this.fret.range,
                        Messages.Warning_HammeringFromHigherFret);
                    element.preConnection = NoteConnection.Pull;
                }
                return true;
            case NoteConnection.Pull:
                if (this.fret === undefined) {
                    logger.report(LogLevel.Error,
                        this.preConnection.range,
                        Messages.Error_FretMissingForPullNote);
                    return false;
                }

                if (this.fret.value === element.preConnectedNote.fret) {
                    logger.report(LogLevel.Warning,
                        this.fret.range,
                        Messages.Warning_PullingToSameFret);
                    element.preConnection = NoteConnection.None;
                } else if (this.fret.value > element.preConnectedNote.fret) {
                    logger.report(LogLevel.Warning,
                        this.fret.range,
                        Messages.Warning_PullingFromLowerFret);
                    element.preConnection = NoteConnection.Hammer;
                }
                return true;
            default:
                throw new RangeError();
        }
    }

    private validatePostConnection(context: DocumentContext,
        logger: ILogger,
        voicePart: VoicePart,
        element: BeatNote): boolean {

        if (this.postConnection === undefined || this.postConnection.value === NoteConnection.None)
            return true;

        const tablatureState = context.documentState as TablatureState;

        if (this.postConnection.value === NoteConnection.SlideOutToHigher
            || this.postConnection.value === NoteConnection.SlideOutToLower) {
            if (this.fret === undefined) {
                logger.report(LogLevel.Error,
                    this.preConnection!.range,
                    Messages.Error_FretMissingForSlideOutNote);
                return false;
            }

            if (this.postConnection.value === NoteConnection.SlideOutToLower
                && this.fret.value <= tablatureState.getCapoFretOffset(this.string.value - 1)) {
                logger.report(LogLevel.Warning,
                    this.fret.range,
                    Messages.Warning_FretTooLowForSlideOutNote);
                element.postConnection = NoteConnection.None;
            }
        }

        return true;
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
    export function parse(scanner: Scanner): IParseResult<BeatNoteNode> {
        const anchor = scanner.makeAnchor();
        const helper = new ParseHelper();
        const node = new BeatNoteNode();

        // read tie
        const tie = helper.absorb(LiteralParsers.readTie(scanner));
        if (tie.value) {
            node.tie = tie.value.tie;
            node.tiePosition = tie.value.tiePosition;
        }
        const isTied = !!tie.value;

        // read pre-connection
        const preConnection = helper.absorb(LiteralParsers.readPreNoteConnection(scanner));
        if (isTied && ParseHelper.isSuccessful(preConnection)) {
            helper.warning(scanner.lastReadRange, Messages.Warning_PreConnectionInTiedNote);
        } else {
            node.preConnection = preConnection.value;
        }

        // read ghost note
        let ghostNoteAnchor = scanner.makeAnchor();
        let ghostNoteOpened = scanner.expectChar("(");

        // read string number
        const string = LiteralParsers.readInteger(scanner);
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
                    ? undefined
                    : new LiteralNode<number>(artificialHarmonicFret.value!.value, artificialHarmonicFret.value!.range);
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