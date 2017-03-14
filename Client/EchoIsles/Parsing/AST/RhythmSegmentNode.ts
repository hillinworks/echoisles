import { RhythmSegmentNodeBase } from "./RhythmSegmentNodeBase";
import { LiteralNode } from "./LiteralNode";
import { Chord } from "../../Core/Sheet/Tablature/Chord";
import { ChordFingeringNode } from "./Tablature/ChordFingeringNode";
import { ILogger } from "../../Core/Logging/ILogger";
import { DocumentContext } from "../DocumentContext";
import { RhythmSegment } from "../../Core/Sheet/RhythmSegment";
import { ChordFingering } from "../../Core/Sheet/Tablature/ChordFingering";
import { Scanner } from "../Scanner";
import { IParseResult, ParseHelper } from "../ParseResult";
import { Messages } from "../Messages";
import { TextRange } from "../../Core/Parsing/TextRange";
import { LiteralParsers } from "../LiteralParsers";

export class RhythmSegmentNode extends RhythmSegmentNodeBase {
    chordName?: LiteralNode<string>;
    fingering?: ChordFingeringNode; // todo: slice this to tablature

    constructor(range?: TextRange) {
        super(range);
    }

    public toDocumentElement(context: DocumentContext, logger: ILogger): RhythmSegment | undefined {
        const segment = new RhythmSegment();
        segment.range = this.range;

        if (!this.fillRhythmSegmentVoices(context, logger, segment))
            return undefined;

        let chordFingering: ChordFingering | undefined = undefined;
        if (this.chordName !== undefined || this.fingering !== undefined) {
            if (this.fingering !== undefined) {
                const result = this.fingering.toDocumentElement(context, logger);
                if (!result)
                    return undefined;

                chordFingering = result;
            }

            const range = this.chordName === undefined
                ? this.fingering!.range
                : this.fingering === undefined
                    ? this.chordName.range
                    : this.chordName.range.union(this.fingering.range);

            const chord = new Chord();
            chord.name = LiteralNode.valueOrUndefined(this.chordName);
            chord.fingering = chordFingering;
            chord.range = range;

            segment.chord = chord;
        }

        return segment;
    }
}

export module RhythmSegmentNode {
    export function parse(scanner: Scanner): IParseResult<RhythmSegmentNode> {
        const anchor = scanner.makeAnchor();
        const node = new RhythmSegmentNode();
        const helper = new ParseHelper();

        let rhythmDefined = false;
        scanner.skipWhitespaces();

        if (scanner.peekChar() === "[") {
            rhythmDefined = true;
            const baseParseResult = helper.absorb(RhythmSegmentNodeBase.parseRhythmDefinition(scanner, node, false));
            if (!ParseHelper.isSuccessful(baseParseResult))
                return helper.fail();
        }

        scanner.skipWhitespaces();
        const chordName = helper.absorb(LiteralParsers.readChordName(scanner));
        if (ParseHelper.isSuccessful(chordName)) {
            node.chordName = chordName.value;

            scanner.skipWhitespaces();
            if (scanner.expectChar("(")) {
                const fingering = helper.absorb(ChordFingeringNode.parse(scanner, s => s.isEndOfLine || s.peekChar() === ")"));
                if (!ParseHelper.isSuccessful(fingering)) {
                    return helper.fail();
                }

                if (fingering.value!.fingerings.length === 0) {
                    return helper.fail(scanner.lastReadRange, Messages.Error_RhythmSegmentMissingFingering);
                }

                node.fingering = fingering.value;

                if (!scanner.expectChar(")")) {
                    return helper.fail(scanner.lastReadRange, Messages.Error_RhythmSegmentChordFingeringNotEnclosed);
                }
            }
        }

        if (!rhythmDefined && !ParseHelper.isSuccessful(chordName) && !node.fingering) {
            return helper.fail(scanner.lastReadRange, Messages.Error_RhythmDefinitionExpected);
        }

        node.range = anchor.range;
        return helper.success(node);
    }
}