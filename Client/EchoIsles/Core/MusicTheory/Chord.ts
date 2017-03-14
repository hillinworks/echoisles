
import { NoteName } from "./NoteName";
import { Interval } from "./Interval";

export class Chord {

    readonly notes: NoteName[];
    readonly name: string;
    bass?: NoteName;

    constructor(name: string, notes: NoteName[]) {
        if (notes.length < 2)
            throw new RangeError("a chord must be consisted by 2 or more notes");

        this.name = name;
        this.notes = notes;
    }
}

export module Chord {
    export function construct(name: string, root: NoteName, ...intervals: Interval[]): Chord {
        const notes = new Array<NoteName>(intervals.length + 1);
        notes[0] = root;
        for (let i = 0; i < intervals.length; ++i) {
            notes[i + 1] = root.offset(intervals[i]);
        }

        return new Chord(name, notes);
    }

    // ReSharper disable InconsistentNaming
    export function X(root: NoteName): Chord {
        return Chord.construct(root.toString(), root, Interval.M3, Interval.P5);
    }

    export function Xm(root: NoteName): Chord {
        return Chord.construct(`${root}m`, root, Interval.m3, Interval.P5);
    }

    export function Xaug(root: NoteName): Chord {
        return Chord.construct(`${root}aug`, root, Interval.M3, Interval.A5);
    }

    export function Xdim(root: NoteName): Chord {
        return Chord.construct(`${root}dim`, root, Interval.m3, Interval.d5);
    }

    export function Xsus2(root: NoteName): Chord {
        return Chord.construct(`${root}sus2`, root, Interval.M2, Interval.P5);
    }

    export function Xsus4(root: NoteName): Chord {
        return Chord.construct(`${root}sus4`, root, Interval.P4, Interval.P5);
    }

    export function X6(root: NoteName): Chord {
        return Chord.construct(`${root}6`, root, Interval.M3, Interval.P5, Interval.M6);
    }

    export function Xm6(root: NoteName): Chord {
        return Chord.construct(`${root}m6`, root, Interval.m3, Interval.P5, Interval.M6);
    }

    export function X7(root: NoteName): Chord {
        return Chord.construct(`${root}7`, root, Interval.M3, Interval.P5, Interval.m7);
    }

    export function Xmaj7(root: NoteName): Chord {
        return Chord.construct(`${root}maj7`, root, Interval.M3, Interval.P5, Interval.M7);
    }

    export function Xm7(root: NoteName): Chord {
        return Chord.construct(`${root}m7`, root, Interval.m3, Interval.P5, Interval.m7);
    }

    export function XmM7(root: NoteName): Chord {
        return Chord.construct(`${root}mM7`, root, Interval.m3, Interval.P5, Interval.M7);
    }

    export function Xdim7(root: NoteName): Chord {
        return Chord.construct(`${root}dim7`, root, Interval.m3, Interval.d5, Interval.d7);
    }

    export function X7sus2(root: NoteName): Chord {
        return Chord.construct(`${root}7sus2`, root, Interval.M2, Interval.P5, Interval.m7);
    }

    export function X7sus4(root: NoteName): Chord {
        return Chord.construct(`${root}7sus4`, root, Interval.M3, Interval.P4, Interval.m7);
    }

    export function Xmaj7sus2(root: NoteName): Chord {
        return Chord.construct(`${root}maj7sus2`, root, Interval.M2, Interval.P5, Interval.M7);
    }

    export function Xmaj7sus4(root: NoteName): Chord {
        return Chord.construct(`${root}maj7sus4`, root, Interval.M3, Interval.P4, Interval.M7);
    }

    // ReSharper restore InconsistentNaming
}