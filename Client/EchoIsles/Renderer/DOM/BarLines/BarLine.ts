import { BarLine as CoreBarLine } from "../../../Core/MusicTheory/BarLine";
import { BarLineBase } from "./BarLineBase";
import { DocumentRow } from "../DocumentRow";
import { StandardBarLine } from "./StandardBarLine";
import { DoubleBarLine } from "./DoubleBarLine";
import { EndBarLine } from "./EndBarLine";
import { BeginRepeatBarLine } from "./BeginRepeatBarLine";
import { EndRepeatBarLine } from "./EndRepeatBarLine";
import { BeginAndEndRepeatBarLine } from "./BeginAndEndRepeatBarLine";
import { BeginRepeatAndEndBarLine } from "./BeginRepeatAndEndBarLine";

export module BarLine {
    export function create(ownerRow: DocumentRow, barLine: CoreBarLine): BarLineBase {
        switch (barLine) {
            case CoreBarLine.Standard:
                return new StandardBarLine(ownerRow, CoreBarLine.Standard);
            case CoreBarLine.Double:
                return new DoubleBarLine(ownerRow, CoreBarLine.Double);
            case CoreBarLine.End:
                return new EndBarLine(ownerRow, CoreBarLine.End);
            case CoreBarLine.BeginRepeat:
                return new BeginRepeatBarLine(ownerRow, CoreBarLine.BeginRepeat);
            case CoreBarLine.EndRepeat:
                return new EndRepeatBarLine(ownerRow, CoreBarLine.EndRepeat);
            case CoreBarLine.BeginAndEndRepeat:
                return new BeginAndEndRepeatBarLine(ownerRow, CoreBarLine.BeginAndEndRepeat);
            case CoreBarLine.BeginRepeatAndEnd:
                return new BeginRepeatAndEndBarLine(ownerRow, CoreBarLine.BeginRepeatAndEnd);
            default:
                throw new Error("unknown bar line type");
        }
    }
}