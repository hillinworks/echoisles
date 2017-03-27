import { Pitch } from "../Pitch";
import { all } from "../../Utilities/LinqLite";

export class Tuning {
    readonly name?: string;
    readonly stringTunings: Pitch[];

    constructor(name: string | undefined, ...stringTunings: Pitch[]) {
        this.name = name;
        this.stringTunings = stringTunings;
    }

    equals(other: Tuning): boolean {
        return other && all(this.stringTunings, (p, i) => other.stringTunings[i].equals(p));
    }

    inOctaveEquals(other: Tuning): boolean {
        return other && all(this.stringTunings, (p, i) => other.stringTunings[i].noteName.equals(p.noteName));
    }
}


