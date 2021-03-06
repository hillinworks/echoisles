﻿import { Node } from "../Node"
import { LiteralNode } from "../LiteralNode";
import { LeftHandFingerIndex } from "../../../Core/Player/LeftHandFingerIndex";
import { ExistencyNode } from "../ExistencyNode";
import { ChordFingeringNote } from "../../../Core/Sheet/Tablature/ChordFingeringNote";
import { TextRange } from "../../../Core/Parsing/TextRange";
import { IParseSuccessResult, ParseHelper } from "../../ParseResult";

export class ChordFingeringNoteNode extends Node {
    fret: LiteralNode<number>;
    fingerIndex?: LiteralNode<LeftHandFingerIndex>;
    importancy?: ExistencyNode;

    constructor(fret: LiteralNode<number>, range?: TextRange) {
        super(range);
        this.fret = fret;
    }

    compile(ignoreFingerIndex: boolean): IParseSuccessResult<ChordFingeringNote> {
        const fingerIndex = ignoreFingerIndex || this.fingerIndex === undefined ? undefined : this.fingerIndex.value;
        const note = new ChordFingeringNote(this.fret.value, fingerIndex, this.importancy !== undefined);
        note.range = this.range;

        return ParseHelper.success(note);
    }
}