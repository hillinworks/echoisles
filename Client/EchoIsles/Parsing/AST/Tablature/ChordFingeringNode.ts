import { Node } from "../Node";
import { ChordFingeringNoteNode } from "./ChordFingeringNoteNode";
import { DocumentContext } from "../../DocumentContext";
import { ChordFingering } from "../../../Core/Sheet/Tablature/ChordFingering";
import { Chord } from "../../../Core/Sheet/Tablature/Chord";
import { Messages } from "../../Messages";
import { Scanner } from "../../Scanner";
import { ParseResult, ParseHelper } from "../../ParseResult";
import { TextRange } from "../../../Core/Parsing/TextRange";
import { LiteralNode } from "../LiteralNode";
import { Defaults } from "../../../Core/Sheet/Tablature/Defaults";
import { LeftHandFingerIndex } from "../../../Core/Player/LeftHandFingerIndex";
import { ExistencyNode } from "../ExistencyNode";
import { L } from "../../../Core/Utilities/LinqLite";

export class ChordFingeringNode extends Node {
    readonly fingerings = new Array<ChordFingeringNoteNode>();

    constructor(range?: TextRange) {
        super(range);
    }

    compile(context: DocumentContext): ParseResult<ChordFingering> {

        const helper = new ParseHelper();

        let fingerIndexSpecified: boolean | undefined = undefined;
        let ignoreFingerIndices = false;
        for (let fingering of this.fingerings) {
            if (fingering.fret.value === Chord.fingeringSkipString || fingering.fret.value === 0) {
                continue;
            }

            if (fingerIndexSpecified === undefined) {
                fingerIndexSpecified = fingering.fingerIndex !== undefined;
                continue;
            }

            if ((fingering.fingerIndex !== undefined && !fingerIndexSpecified)
                || (fingering.fingerIndex === undefined && fingerIndexSpecified)) {
                helper.warning(this.range, Messages.Warning_ChordNotAllFingerIndexSpecified);
                ignoreFingerIndices = true;
                break;
            }
        }

        // todo: validate unreasonable fingering

        const element = new ChordFingering();
        element.range = this.range;
        element.notes = L(this.fingerings).select(n => {
            const note = n.compile(ignoreFingerIndices);
            helper.absorb(note);
            return note.value;
        }).toArray();

        return helper.success(element);
    }
}

export module ChordFingeringNode {
    export function parse(scanner: Scanner, terminatorPredicate: Scanner.Predicate): ParseResult<ChordFingeringNode> {
        const anchor = scanner.makeAnchor();
        const helper = new ParseHelper();
        const node = new ChordFingeringNode();

        const remainingLine = scanner.remainingLine.trim();
        const containsDelimiter = remainingLine.search("\\s+") > 0;
        const containsFingerIndexSpecifier = remainingLine.includes("<") || remainingLine.includes(">");
        const isShortForm = !containsDelimiter && !containsFingerIndexSpecifier;

        while (!terminatorPredicate(scanner)) {
            const noteAnchor = scanner.makeAnchor();

            const str = isShortForm
                ? scanner.readPattern("[\\dxX\\-]")
                : scanner.readAnyPatternOf("\\d+", "[xX\\-]");

            if (!str || str.length === 0) {
                return helper.fail(scanner.lastReadRange, Messages.Error_ChordFingeringInvalidFingering);
            }

            switch (str) {
                case "x":
                case "X":
                case "-":
                    const fret = LiteralNode.create(Chord.fingeringSkipString, scanner.lastReadRange);
                    node.fingerings.push(new ChordFingeringNoteNode(fret, scanner.lastReadRange));
                    break;

                default:

                    const fretNumber = parseInt(str!);
                    if (isNaN(fretNumber)) {
                        return helper.fail(scanner.lastReadRange, Messages.Error_ChordFingeringInvalidFingering);
                    }

                    if (fretNumber > Defaults.highestFret) {
                        helper.warning(scanner.lastReadRange, Messages.Warning_ChordFingeringFretTooHigh);
                    }

                    const note = new ChordFingeringNoteNode(LiteralNode.create(fretNumber, scanner.lastReadRange), scanner.lastReadRange);

                    if (fretNumber > 0) {
                        scanner.skipWhitespaces();
                        if (scanner.expectChar("<")) {
                            scanner.skipWhitespaces();

                            const fingerIndexString = scanner.readPattern("[\\dtT]");
                            if (!fingerIndexString || fingerIndexString.length === 0) {
                                return helper.fail(scanner.textPointer.toRange(),
                                    Messages.Error_ChordFingerIndexExpected);
                            }

                            const fingerIndex = LeftHandFingerIndex.parse(fingerIndexString!);

                            if (fingerIndex === undefined) {
                                return helper.fail(scanner.lastReadRange, Messages.Error_UnrecognizableFingerIndex);
                            }

                            note.fingerIndex = LiteralNode.create(fingerIndex, scanner.lastReadRange);

                            scanner.skipWhitespaces();

                            const importancy = helper.absorb(ExistencyNode.parseCharExistency(scanner, "!"));
                            if (ParseHelper.isSuccessful(importancy)) {
                                note.importancy = importancy.value;
                                scanner.skipWhitespaces();
                            }

                            if (!scanner.expectChar(">")) {
                                return helper.fail(scanner.textPointer.toRange(), Messages.Error_ChordFingerIndexNotEnclosed);
                            }
                        }
                    }

                    note.range = noteAnchor.range;
                    node.fingerings.push(note);
                    break;
            }

            scanner.skipWhitespaces();
        }

        if (node.fingerings.length !== Defaults.strings) {
            return helper.fail(scanner.lastReadRange,
                Messages.Error_ChordFingeringNotMatchingStringCount,
                Defaults.strings);
        }

        node.range = anchor.range;
        return helper.success(node);
    }
}