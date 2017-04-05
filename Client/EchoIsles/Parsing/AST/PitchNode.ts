import { Node } from "./Node";
import { LiteralNode } from "./LiteralNode";
import { NoteNameNode } from "./NoteNameNode";
import { Pitch, neutralOctaveGroup } from "../../Core/MusicTheory/Pitch";
import { Scanner } from "../Scanner";
import { LiteralParsers } from "../LiteralParsers";
import { ParseResult, ParseHelper } from "../ParseResult";
import { TextRange } from "../../Core/Parsing/TextRange";

export class PitchNode extends Node {

    static parse(scanner: Scanner): ParseResult<PitchNode> {
        const anchor = scanner.makeAnchor();

        const noteName = NoteNameNode.parse(scanner);
        if (!ParseHelper.isSuccessful(noteName)) {
            return ParseHelper.relayFailure(noteName);
        }

        const octave = LiteralParsers.readInteger(scanner);

        return ParseHelper.success(new PitchNode(anchor.range, noteName.value!, octave.value));
    }


    constructor(range: TextRange, readonly noteName: NoteNameNode, readonly octaveGroup?: LiteralNode<number>) {
        super(range);
        this.noteName = noteName;
        this.octaveGroup = octaveGroup;
    }

    toPitch(): Pitch {
        return new Pitch(this.noteName.toNoteName(), LiteralNode.valueOrDefault(this.octaveGroup, neutralOctaveGroup));
    }
}