// ReSharper disable InconsistentNaming

export module Messages {

    export const Error_InvalidNumber = "Invalid number";

    export const Error_FretMissingForSlideInNote = "Fret must be specified for a note with slide-in effect";
    export const Warning_FretTooLowForSlideInNote =
        "Fret too low for a note with slide-in effect, the slide-in effect is ignored";


    export const Error_FretMissingForSlideOutNote = "Fret must be specified for a note with slide-out effect";
    export const Warning_FretTooLowForSlideOutNote =
        "Fret too low for a note with slide-out effect, the slide-out effect is ignored";

    export const Error_FretMissingForSlideNote = "Fret must be specified for a note with slide effect";
    export const Warning_SlidingToSameFret = "Sliding from and to the same fret, the slide effect is ignored";

    export const Error_FretMissingForPullNote = "Fret must be specified for a note with pull effect";
    export const Warning_PullingToSameFret = "Pulling from and to the same fret, the pull effect is ignored";
    export const Warning_PullingFromLowerFret =
        "Pulling from a lower fret, the pull effect will be replaced with hammer";

    export const Error_FretMissingForHammerNote = "Fret must be specified for a note with hammer effect";
    export const Warning_HammeringToSameFret = "Hammering from and to the same fret, the hammer effect is ignored";
    export const Warning_HammeringFromHigherFret =
        "Hammering from a higher fret, the hammer effect will be replaced with pull";

    export const Warning_TemplateBarCannotContainLyrics =
        "Pattern templates cannot contain lyrics. These lyrics will be omitted";

    export const Suggestion_LyricsTooLong =
        "This line of lyrics is splitted into too many parts to match the rhythm. You can group words in the same beat with parenthesises.";
    export const Error_InstructionExpected = "An instruction is expected";
    export const Error_UnknownInstruction = "Unrecognizable instruction";

    export const Error_NoteValueExpected = "Note value expected";
    export const Error_InvalidReciprocalNoteValue = "Reciprocal value must be power of 2 (e.g. 4, 8, 16 etc.)";
    export const Error_TupletValueExpected = "Tuplet value expected";
    export const Error_InvalidTuplet = "Tuplet value must be between 3 and 63, and cannot be power of 2";

    export const Error_TooManyDotsInNoteValueAugment = "At most three dots supported as note value augment";

    export const Error_InvalidNoteName = "Unrecognizable note name";
    export const Error_InvalidAccidental = "Unrecognizable accidental";

    export const Suggestion_TuningNotSpecified = "Redundant empty tuning specifier (standard tuning used)";
    export const Error_InvalidTuning = "Unrecognizable tuning specifier, standard tuning assumed";

    export const Hint_RedundantKnownTuningSpecifier =
        "\"{0}\" is a well-known tuning, so you don't have to explicitly define it";

    export const Hint_RedundantColonInTuningSpecifier = "Redundant ':' in tuning specifier";

    export const Error_TuningInstructionAfterBarAppeared = "Tuning instruction must appear before all bars";

    export const Warning_RedefiningTuningInstruction =
        "Tuning is already defined, this instruction will be ignored";


    export const Error_MissingChordName = "Please specify a chord name";

    export const Error_ChordDisplayNameNotEnclosed =
        "Chord display name specifier is not enclosed with '>'";

    export const Error_ChordCommandletMissingFingering = "Missing chord fingering";

    export const Error_ChordFingeringInvalidFingering = "Unrecognizable chord fingering";

    export const Error_ChordFingeringNotMatchingStringCount =
        "{0} fingering specifiers is required for a chord";

    export const Warning_ChordFingeringFretTooHigh = "This chord involves fret that is too high to play";

    export const Error_ChordFingerIndexExpected = "Finger index specifier expected";

    export const Error_ChordFingerIndexNotEnclosed = "Finger index specifier is not enclosed with '>'";

    export const Error_UnrecognizableFingerIndex = "Unrecognizable finger index, use 1, 2, 3, 4 or T";

    export const Warning_ChordAlreadyDefined =
        "A chord with the same name is already defined, this one will be ignored";

    export const Warning_ChordNotAllFingerIndexSpecified =
        "Some but not all finger indices are specified for this chord, finger indices will be ignored";

    export const Suggestion_UnknownChord =
        "'{0}' is not a known chord, please define it using the +chord instruction";

    export const Error_InvalidTimeSignature =
        "Unrecognizable time signature, please use a time signature like 4/4. 4/4 assumed.";
        
    export const Error_UnsupportedBeatsInTimeSignature =
        "Time signature with more than 32 beats per bar is not supported. 4/4 assumed.";

    export const Error_UnsupportedNoteValueInTimeSignature =
        "Time signature with a note value shorter than 1/32 is not supported. 4/4 assumed.";

    export const Error_IrrationalNoteValueInTimeSignatureNotSupported =
        "Time signature with an irrational note value is not supported. 4/4 assumed.";

    export const Suggestion_UselessTimeInstruction =
        "Redundant time instruction, the score is already in this time";

    export const Error_TimeInstructionAfterBarAppearedOrRhythmInstruction =
        "The first time signature instruction must appear before all bars and rhythm instructions";

    export const Error_InvalidKeySignature = "Unrecognizable key signature, key signature ignored";

    export const Suggestion_RedundantKeySignature =
        "Redundant key signature, the score is already in this key";

    export const Error_InvalidTempoSignature =
        "Unrecognizable tempo signature, please use a tempo signature like 4=72. Tempo signature ignored";

    export const Error_IrrationalNoteValueInTempoSignatureNotSupported =
        "Tempo signature with an irrational note value is not supported, tempo signature ignored";

    export const Error_InvalidTempoSignatureSpeed = "Invalid speed value";
    export const Error_TempoSignatureSpeedTooLow = "Tempo speed is too low";

    export const Error_TempoSignatureSpeedTooFast =
        "Tempo speed is too fast, the maximum tempo speed is 10000";

    export const Suggestion_UselessTempoInstruction =
        "Redundant tempo instruction, the score is already in this tempo";

    export const Error_InvalidCapoPosition = "Unrecognizable capo position, capo instruction ignored";
    export const Warning_CapoTooHigh = "Capo position is too high, maximum capo position is 12";

    export const Warning_CapoStringsSpecifierNotEnclosed =
        "Capo strings specifier is not enclosed with ')', all strings assumed";

    export const Error_CapoStringsSpecifierInvalidStringNumber =
        "Invalid string number, all strings assumed";

    export const Warning_RedundantCapoStringSpecifier = "String #{0} is specified for more than once";

    export const Error_CapoInstructionAfterBarAppeared = "Capo instruction must appear before all bars";

    export const Suggestion_UselessCapoInstruction =
        "This capo instruction is useless because it's overridden by other capo instructions";

    export const Warning_RhythmSegmentMissingCloseBracket =
        "Missing close bracket, please use both brackets or don't use brackets at all";
    export const Error_RhythmSegmentMissingCloseBracket =
        "Missing close bracket";
    export const Warning_EmptyRhythmSegment =
        "This rhythm segment is empty. To use a rhythm template, omit this rhythm segment";

    export const Error_UnrecognizableRhythmSegmentElement =
        "Unrecognizable note";

    export const Error_TooManyVoices =
        "Too many voices, only 2 voices (regular and bass) supported";

    export const Error_RhythmInstructionMissingCloseParenthesisInStringsSpecifier =
        "Missing close parenthesis in strings specifier";

    export const Error_InvalidStringNumberInStringsSpecifier =
        "Unrecognizable string number";

    export const Error_InvalidFretNumberInStringsSpecifier =
        "Unrecognizable fret number";

    export const Error_GhostNoteNotEnclosed =
        "Ghost note not enclosed with ')'";

    export const Error_NaturalHarmonicNoteNotEnclosed =
        "Natural harmonic note not enclosed with '>'";

    export const Error_ArtificialHarmonicFretSpecifierNotEnclosed =
        "Artificial harmonic fret specifier is not enclosed with '>'";

    export const Warning_BothNaturalAndArtificialHarmonicDeclared =
        "Both natural and artificial harmonics are defined for this note, the natural harmonic will be ignored";

    export const Warning_ArtificialHarmonicFretTooSmall =
        "Dominant hand fretting of artificial harmonic cannot be lower than the pressed fret";

    export const Error_InvalidFretNumberInArtificialHarmonicSpecifier =
        "Unrecognizable fret number for artificial harmonic";

    export const Warning_EffectTechniqueInTiedNote =
        "Specifying effect techniques in a tied note, these techniques will be ignored";

    export const Warning_PreConnectionInTiedNote =
        "Specifying pre-connection in a tied note, the specifier will be ignored";

    export const Warning_PreConnectionInTiedBeat =
        "Specifying pre-connection in a tied beat, the specifier will be ignored";

    export const Error_ConnectionPredecessorNotExisted =
        "Cannot find a note as predecessor of the pre-connection of this note";
    export const Warning_TiedNoteMismatch =
        "The tied note does not match its predecessor, the tie mark will be ignored";

    export const Warning_FretUnderCapo =
        "The note on the #{1} fret of #{0} string cannot be played because it's under fret position";

    export const Error_RhythmSegmentExpectOpeningBracket = "'[' expceted to declare a rhythm";

    export const Suggestion_UselessRhythmInstruction =
        "Redundant rhythm instruction, the score is already in this rhythm";

    export const Error_BeatBodyExpected =
        "Note value, strings specification or all-string strum technique expected";
    export const Error_BeatModifierExpected =
        "Strum technique, note effect technique, duration effect, accent or connection expected";
    export const Warning_BeatStrumTechniqueAlreadySpecified =
        "Strum technique is already specified for this note, this one will be ignored";

    export const Warning_ConflictedStrumTechniques =
        "Two voices in the same column has conflicted strum techniques. The technique specified for the bass voice will be ignored";

    export const Warning_StrumTechniqueForRestBeat =
        "Strum technique specified for a rest beat, the technique will be ignored";
    export const Warning_StrumTechniqueForTiedBeat =
        "Strum technique specified for a tied beat, the technique will be ignored";


    export const Warning_OrnamentAlreadySpecified =
        "Ornament is already specified for this beat, this one will be ignored";

    export const Warning_NoteRepetitionAlreadySpecified =
        "Note repetition is already specified for this beat, this one will be ignored";

    export const Warning_BeatNoteHoldAndPauseEffectAlreadySpecified =
        "Hold/pause effect is already specified for this note, this one will be ignored";
    export const Warning_BeatAccentAlreadySpecified =
        "Accent is already specified for this note, this one will be ignored";
    export const Warning_BeatConnectionAlreadySpecified =
        "Connection is already specified for this note, this one will be ignored";

    export const Warning_BeatsNotMatchingTimeSignature = "Beats in this bar does not match time signature";


    export const Warning_SectionNameMissingCloseQuoteMark = "Missing close quote mark";
    export const Warning_EmptySectionName = "Empty section name, ignored";
    export const Warning_DuplicatedSectionName = "Section {0} is already defined";

    export const Warning_AlternationTextExpectedAfterColon =
        "Alternation text expected. If you want to use implicit alternation text, omit the colon";
    export const Hint_EmptyAlternationText = "Empty alternation text, will use automatic index";
    export const Error_InvalidAlternationText =
        "Unrecognizable alternation text, use 1 to 9 (arabic numerals) or I to IX (roman numerals)";

    export const Warning_StaffCommandletUnknownStaffType =
        "Unknown or unsupported staff type, guitar assumed";

    export const Error_UnexpectedLyrics =
        "Unexpected lyrics, lyrics should only appear at the end of a bar for not more than once";

    export const Warning_UnexpectedBarVoice =
        "Unexpected voice, rhythm or chord here, ignored. Please place them before lyrics";

    export const Suggestion_InconsistentVoiceDuration =
        "This voice is shorter than other voices in this segment, it will be filled with rest";

    export const Error_InconsistentVoiceDurationCannotBeFilledWithRest =
        "This voice is shorter than other voices in this segment, but its shortage cannot be resolved to rest of simple note values. Please fix the voice to match duration of other voices";

    export const Warning_TiedLyricsNotEnclosed = "Tied lyrics not enclosed with ')'";
    export const Error_RhythmSegmentMissingFingering = "Missing chord fingering";

    export const Error_RhythmSegmentChordFingeringNotEnclosed =
        "Chord fingering is not enclosed with ')'";

    export const Error_RhythmDefinitionExpected = "rhythm definition, chord name or anonymous chord fingering expected";

    export const Warning_PatternBodyNotEnclosed =
        "pattern body is not enclosed with '}'";

    export const Warning_PatternInstanceBarsLessThanTemplateBars =
        "this pattern contains less bars than it's defined in its template";

    export const Error_InvalidBarLineInPattern = "Only standard bar line allowed in patterns";
    export const Error_PatternInstanceBarsExpected = "Instance bars expected";

    export const Warning_RedundantModifiersInRestBeat =
        "This beat is a rest, so all other specifiers are omitted";

    export const Hint_RedundantModifiersInTiedBeat =
        "This is a tied beat, you don't need to write it again";

    export const Warning_InconsistentAlternationTextExplicity =
        "Either specify all alternation texts explicitly, or leave them empty at all";

    export const Warning_InconsistentAlternationTextType =
        "Inconsistent alternation text type (arabic or roman number representation), the first representation type will be adopted";

    export const Error_DuplicatedAlternationText = "Alternation {0} is already defined";
    export const Error_MissingAlternationTexts = "The following alternation(s) is/are missing: {0}";

    export const Hint_FirstOpenBarLineMissing = "Missing first open bar line, standard line assumed";
    export const Hint_LastCloseBarLineMissing = "Missing close bar line, end line assumed";
    export const Warning_BarLineMissing = "Missing bar line, standard line assumed";

    export const Warning_DoubleBarLineCannotBeOpenLine =
        "Double bar line cannot be used as an open bar line, standard line assumed. Try to place it at the end of the previous bar";

    export const Warning_TooManyChordsToMatchRhythmTemplate =
        "This bar has more chords than it's allowed in the rhythm template. The exceeding chords will be omitted";

    export const Warning_InsufficientChordsToMatchRhythmTemplate =
        "This bar has less chords than it's defined in the rhythm template. The shortage will be filled with the last chord";

    export const Warning_TooManyChordsToMatchPatternTemplate =
        "This bar has more chords than it's allowed in the pattern template. The exceeding chords will be omitted";

    export const Warning_InsufficientChordsToMatchPatternTemplate =
        "This bar has less chords than it's defined in the pattern template. The shortage will be filled with the last chord";

    export const Error_ChordNameUnexpectedText = "Unexpected '{0}";

    export const Error_ChordDim9NotSupported = "Diminished 9th chord (dim9) is not supported";
    export const Error_ChordDim11NotSupported = "Diminished 11th chord (dim11) is not supported";
    export const Error_ChordDim13NotSupported = "Diminished 13th chord (dim13) is not supported";

    export const Error_ChordMissingOrInvalidBassNote = "Missing or invalid bass note name";

    export const Error_ChordAltered5thNotAvailable =
        "Altered 5th is only applicable for chords with more than 3 notes";

    export const Error_ChordAltered9thNotAvailable =
        "Altered 9th is only applicable for chords with more than 5 notes";

    export const Error_ChordAltered11thNotAvailable =
        "Altered 11th is only applicable for chords with more than 6 notes";

    export const Error_ChordSuspended2NotAvailable =
        "Suspended 2th (sus2) is only applicable for major chords";

    export const Error_ChordSuspended4NotAvailable =
        "Suspended 4th (sus4) is only applicable for major chords";

    export const Error_ChordAdded9thNotAvailable =
        "Added 9th is only applicable for triads";

    export const Error_ChordAdded11thNotAvailable =
        "Added 11th is only applicable for triads or seventh chords";

    export const Error_ChordAdded13thNotAvailable =
        "Added 13th is only applicable for triads, seventh chords or ninth chords";


}