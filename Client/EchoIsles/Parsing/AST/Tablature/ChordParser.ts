import { Scanner } from "../../Scanner";
import { Interval } from "../../../Core/MusicTheory/Interval";
import { IParseResult, ParseHelper, ParseResultType } from "../../ParseResult";
import { NoteNameNode } from "../NoteNameNode";
import { Chord } from "../../../Core/MusicTheory/Chord";
import { NoteName } from "../../../Core/MusicTheory/NoteName";
import { TextRange } from "../../../Core/Parsing/TextRange";
import { Messages } from "../../Messages";

enum TriadQuality {
    Diminished,
    Minor,
    Major,
    Augmented
}

export class ChordParser {

    private scanner: Scanner;
    private helper: ParseHelper;
    private readonly intervals = new Array<Interval>();
    private triadQuality: TriadQuality;
    private addedToneRead: boolean;

    private addIntervals(...intervals: Interval[]): void {
        this.intervals.push(...intervals);
    }

    parse(chordName: string): IParseResult<Chord> {

        this.helper = new ParseHelper();
        this.scanner = new Scanner(chordName.trim());

        const noteName = NoteNameNode.parse(this.scanner);
        if (!ParseHelper.isSuccessful(noteName)) {
            return this.helper.relayFailure(noteName);
        }

        const root = noteName.value!.toNoteName();

        if (this.scanner.isEndOfInput) {
            return this.helper.success(Chord.construct(chordName, root, Interval.M3, Interval.P5));
        }

        this.intervals.length = 0;

        let isFifth = false;

        if (this.scanner.expectChar("5")) { //5th

            this.addIntervals(Interval.P5);
            isFifth = true;

        } else if (this.scanner.expect("ø7")) { // half diminished seventh

            this.addIntervals(Interval.m3, Interval.d5, Interval.m7);

        } else {

            const readDominantResult = this.readDominant();

            if (!ParseHelper.isSuccessful(readDominantResult)) {

                if (readDominantResult.result === ParseResultType.Failed)
                    return this.helper.fail();

                let readTriadResult = this.readTriad();

                if (ParseHelper.isSuccessful(readTriadResult)) {

                    if (!ParseHelper.isSuccessful(this.readSeventh())) {

                        if (this.readExtended().result === ParseResultType.Failed) {
                            return this.helper.fail();
                        }

                    }

                } else {

                    if (readTriadResult.result === ParseResultType.Failed) {
                        return this.helper.fail();
                    }

                    if (this.readSimplifiedAddedTone().result === ParseResultType.Failed) {
                        return this.helper.fail();
                    }
                }
            }
        }


        let bass: NoteName | undefined = undefined;
        if (!isFifth) {
            if (this.readSuspended().result === ParseResultType.Failed) {
                return this.helper.fail();
            }

            if (!this.addedToneRead) {
                if (this.readAddedTone().result === ParseResultType.Failed) {
                    return this.helper.fail();
                }
            }

            if (this.readAltered().result === ParseResultType.Failed) {
                return this.helper.fail();
            }

            const readBassResult = this.readBass();
            if (ParseHelper.isSuccessful(readBassResult)) {
                bass = readBassResult.value;
            } else if (readBassResult.result === ParseResultType.Failed) {
                return this.helper.fail();
            }
        }

        this.scanner.skipWhitespaces();
        if (!this.scanner.isEndOfInput) {
            return this.helper.fail(new TextRange(this.scanner.textPointer,
                    this.scanner.remainingLine.length,
                    this.scanner.source),
                Messages.Error_ChordNameUnexpectedText,
                this.scanner.remainingLine); 
        }

        const chord = Chord.construct(chordName, root, ...this.intervals);
        chord.bass = bass;

        return this.helper.success(chord);

    }


    private readExtended(): IParseResult<void> {
        switch (this.scanner.readAnyPatternOf("9", "11", "13")) {
            case "9":
                switch (this.triadQuality) {
                    case TriadQuality.Diminished:
                        return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordDim9NotSupported); // Cdim9 not supported
                    case TriadQuality.Minor:
                        this.addIntervals(Interval.m7, Interval.M9);  // Cm9
                        return ParseHelper.success(undefined);
                    case TriadQuality.Major:
                        this.addIntervals(Interval.M7, Interval.M9);  // CM9
                        return ParseHelper.success(undefined);
                    case TriadQuality.Augmented:
                        this.addIntervals(Interval.m7, Interval.M9);  // Caug9
                        return ParseHelper.success(undefined);
                }
                throw new Error();  // should not reach here
            case "11":
                switch (this.triadQuality) {
                    case TriadQuality.Diminished:
                        return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordDim11NotSupported);   // Cdim11 not supported
                    case TriadQuality.Minor:
                        this.addIntervals(Interval.m7, Interval.M9, Interval.P11);  // Cm11
                        return ParseHelper.success(undefined);
                    case TriadQuality.Major:
                        this.addIntervals(Interval.M7, Interval.M9, Interval.P11);  // CM11
                        return ParseHelper.success(undefined);
                    case TriadQuality.Augmented:
                        this.addIntervals(Interval.m7, Interval.M9, Interval.P11);  // Caug11
                        return ParseHelper.success(undefined);
                }
                throw new Error();  // should not reach here
            case "13":
                switch (this.triadQuality) {
                    case TriadQuality.Diminished:
                        return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordDim13NotSupported);   // Cdim13 not supported
                    case TriadQuality.Minor:
                        this.addIntervals(Interval.m7, Interval.M9, Interval.P11, Interval.M13);  // Cm13
                        return ParseHelper.success(undefined);
                    case TriadQuality.Major:
                        this.addIntervals(Interval.M7, Interval.M9, Interval.P11, Interval.M13);  // CM13
                        return ParseHelper.success(undefined);
                    case TriadQuality.Augmented:
                        this.addIntervals(Interval.m7, Interval.M9, Interval.P11, Interval.M13);  // Caug13
                        return ParseHelper.success(undefined);
                }
                throw new Error();  // should not reach here
        }

        return ParseHelper.empty();
    }

    private readBass(): IParseResult<NoteName> {

        if (!this.scanner.expectChar("/"))
            return this.helper.empty();

        const noteName = NoteNameNode.parse(this.scanner);
        if (!ParseHelper.isSuccessful(noteName)) {
            return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordMissingOrInvalidBassNote); 
        }

        return this.helper.success(noteName.value!.toNoteName());
    }

    private readAltered(): IParseResult<void> {
        this.scanner.skipWhitespaces();
        switch (this.scanner.readAnyPatternOf("\+5", "\\#5", "♯5", "\\-9", "b9", "♭9", "\\+9", "\\#9", "♯9", "\\+11", "\\#11", "♯11")) {
            case "+5":
            case "#5":
            case "♯5":
                if (this.intervals.length < 3) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAltered5thNotAvailable);   // only available to 7th+
                }

                if (this.intervals[1] === Interval.A5) {
                    // already has it
                }

                this.intervals[1] = Interval.A5;
                return ParseHelper.success(undefined);
            case "-9":
            case "b9":
            case "♭9":
                if (this.intervals.length < 5) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAltered9thNotAvailable);   // only available to 11th+
                }

                if (this.intervals[3] === Interval.m9) {
                    // already has it
                }

                this.intervals[3] = Interval.m9;
                return ParseHelper.success(undefined);
            case "+9":
            case "#9":
            case "♯9":
                if (this.intervals.length < 5) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAltered9thNotAvailable);   // only available to 11th+
                }

                if (this.intervals[3] === Interval.A9) {
                    // already has it
                }

                this.intervals[3] = Interval.A9;
                return ParseHelper.success(undefined);
            case "+11":
            case "#11":
            case "♯11":
                if (this.intervals.length < 6) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAltered11thNotAvailable);   // only available to 13th+
                }

                if (this.intervals[4] === Interval.A11) {
                    // already has it
                }

                this.intervals[4] = Interval.A11;
                return ParseHelper.success(undefined);
        }

        return ParseHelper.empty();
    }

    private readSuspended(): IParseResult<void> {
        this.scanner.skipWhitespaces();
        switch (this.scanner.readAnyPatternOf("sus2", "sus4", "sus")) {
            case "sus2":

                if (this.intervals[0] !== Interval.M3) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordSuspended2NotAvailable);
                }

                this.intervals[0] = Interval.M2;
                return ParseHelper.success(undefined);
            case "sus4":
            case "sus":
                if (this.intervals[0] !== Interval.M3) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordSuspended4NotAvailable);
                }

                this.intervals[0] = Interval.P4;
                return ParseHelper.success(undefined);
        }

        return ParseHelper.empty();
    }

    private readAddedTone(): IParseResult<void> {
        this.scanner.skipWhitespaces();
        switch (this.scanner.readAnyPatternOf("add\\#9", "add♯9", "addb9", "add♭9", "add9", "add\\#11", "add♯11", "add11", "add\\#13", "add♯13", "addb13", "add♭13", "add13")) {
            case "add#9":
            case "add♯9":

                if (this.intervals.length > 2) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAdded9thNotAvailable);   // only available to triads
                }

                this.addIntervals(Interval.A9);
                return ParseHelper.success(undefined);
            case "addb9":
            case "add♭9":

                if (this.intervals.length > 2) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAdded9thNotAvailable);   // only available to triads
                }

                this.addIntervals(Interval.m9);
                return ParseHelper.success(undefined);
            case "add9":

                if (this.intervals.length > 2) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAdded9thNotAvailable);  // only available to triads
                }

                this.addIntervals(Interval.M9);
                return ParseHelper.success(undefined);
            case "add#11":
            case "add♯11":

                if (this.intervals.length > 3) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAdded11thNotAvailable);   // only available to triads or seventh
                }

                this.addIntervals(Interval.A11);
                return ParseHelper.success(undefined);
            case "add11":

                if (this.intervals.length > 3) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAdded11thNotAvailable);   // only available to triads or seventh
                }

                this.addIntervals(Interval.P11);
                return ParseHelper.success(undefined);
            case "add#13":
            case "add♯13":

                if (this.intervals.length > 4) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAdded13thNotAvailable);  // only available to triads, sevenths, or ninths
                }

                this.addIntervals(Interval.A13);
                return ParseHelper.success(undefined);
            case "addb13":
            case "add♭13":

                if (this.intervals.length > 4) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAdded13thNotAvailable);  // only available to triads, sevenths, or ninths
                }

                this.addIntervals(Interval.m13);
                return ParseHelper.success(undefined);
            case "add13":

                if (this.intervals.length > 4) {
                    return this.helper.fail(this.scanner.lastReadRange, Messages.Error_ChordAdded13thNotAvailable);   // only available to triads, sevenths, or ninths
                }

                this.addIntervals(Interval.M13);
                return ParseHelper.success(undefined);
        }

        return ParseHelper.empty();
    }

    private readSimplifiedAddedTone(): IParseResult<void> {
        switch (this.scanner.readAnyPatternOf("6\\/9", "69", "2", "4", "6")) {
            case "6/9":
            case "69":
                this.addIntervals(Interval.M6, Interval.M9);
                this.addedToneRead = true;
                return ParseHelper.success(undefined);
            case "2":
                this.addIntervals(Interval.M9);
                this.addedToneRead = true;
                return ParseHelper.success(undefined);
            case "4":
                this.addIntervals(Interval.P11);
                this.addedToneRead = true;
                return ParseHelper.success(undefined);
            case "6":
                this.addIntervals(Interval.M13);
                this.addedToneRead = true;
                return ParseHelper.success(undefined);
        }
        return ParseHelper.empty();
    }

    private readDominant(): IParseResult<void> {
        switch (this.scanner.readAnyPatternOf("dom7", "7", "9", "11", "13")) {
            case "dom7":
            case "7":
                this.addIntervals(Interval.M3, Interval.P5, Interval.m7);
                return ParseHelper.success(undefined);
            case "9":
                this.addIntervals(Interval.M3, Interval.P5, Interval.m7, Interval.M9);
                return ParseHelper.success(undefined);
            case "11":
                this.addIntervals(Interval.M3, Interval.P5, Interval.m7, Interval.M9, Interval.P11);
                return ParseHelper.success(undefined);
            case "13":
                this.addIntervals(Interval.M3, Interval.P5, Interval.m7, Interval.M9, Interval.P11, Interval.M13);
                return ParseHelper.success(undefined);
        }

        return ParseHelper.empty();
    }

    private readSeventh(): IParseResult<void> {
        this.scanner.skipWhitespaces();
        switch (this.scanner.readAnyPatternOf("maj7", "M7", "Δ7", "7")) {
            case "maj7":
            case "M7":
            case "Δ7":
                this.addIntervals(Interval.M7);  // CmM7
                return ParseHelper.success(undefined);
            case "7":
                switch (this.triadQuality) {
                    case TriadQuality.Diminished:
                        this.addIntervals(Interval.d7);  // Cdim7
                        return ParseHelper.success(undefined);
                    case TriadQuality.Minor:
                        this.addIntervals(Interval.m7);  // Cm7
                        return ParseHelper.success(undefined);
                    case TriadQuality.Major:
                        this.addIntervals(Interval.M7);  // CM7
                        return ParseHelper.success(undefined);
                    case TriadQuality.Augmented:
                        this.addIntervals(Interval.m7);  // Caug7
                        return ParseHelper.success(undefined);
                }
                break;
        }

        return ParseHelper.empty();
    }

    private readTriad(): IParseResult<void> {
        switch (this.scanner.readAnyPatternOf("maj", "min", "aug", "dim", "M", "m", "Δ", "\\+", "\\-", "°")) {
            case "":
            case "maj":
            case "M":
            case "Δ":
                this.addIntervals(Interval.M3, Interval.P5);
                this.triadQuality = TriadQuality.Major;
                return ParseHelper.success(undefined);
            case "min":
            case "m":
                this.addIntervals(Interval.m3, Interval.P5);
                this.triadQuality = TriadQuality.Minor;
                return ParseHelper.success(undefined);
            case "aug":
            case "+":
                this.addIntervals(Interval.M3, Interval.A5);
                this.triadQuality = TriadQuality.Augmented;
                return ParseHelper.success(undefined);
            case "dim":
            case "-":
            case "°":
                this.addIntervals(Interval.m3, Interval.d5);
                this.triadQuality = TriadQuality.Diminished;
                return ParseHelper.success(undefined);
        }

        return ParseHelper.empty();
    }
}
