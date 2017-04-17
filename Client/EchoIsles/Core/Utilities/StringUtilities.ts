export module StringUtilities {

    export function fixedFromCharCode(codePt: number): string {
        if (codePt > 0xFFFF) {
            codePt -= 0x10000;
            return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
        } else {
            return String.fromCharCode(codePt);
        }
    }

    export function formatString(format: string, ...args: any[]) {
        return format.replace(/{(\d+)}/g,
            (match, i) => args[i] !== undefined
                ? args[i].toString()
                : match);
    };

    /**
     * White space characters are the following Unicode characters:
     * Members of the SpaceSeparator category, which includes the characters SPACE (U+0020), OGHAM SPACE MARK (U+1680), EN QUAD (U+2000), EM QUAD (U+2001), EN SPACE (U+2002), EM SPACE (U+2003), THREE-PER-EM SPACE (U+2004), FOUR-PER-EM SPACE (U+2005), SIX-PER-EM SPACE (U+2006), FIGURE SPACE (U+2007), PUNCTUATION SPACE (U+2008), THIN SPACE (U+2009), HAIR SPACE (U+200A), NARROW NO-BREAK SPACE (U+202F), MEDIUM MATHEMATICAL SPACE (U+205F), and IDEOGRAPHIC SPACE (U+3000).
     * Members of the LineSeparator category, which consists solely of the LINE SEPARATOR character (U+2028).
     * Members of the ParagraphSeparator category, which consists solely of the PARAGRAPH SEPARATOR character (U+2029).
     * The characters CHARACTER TABULATION (U+0009), LINE FEED (U+000A), LINE TABULATION (U+000B), FORM FEED (U+000C), CARRIAGE RETURN (U+000D), NEXT LINE (U+0085), and NO-BREAK SPACE (U+00A0).
     */
    export function isWhitespaceChar(char: string): boolean {
        return char === "\u0020"
            || char === "\u1680"
            || char === "\u2000"
            || char === "\u2001"
            || char === "\u2002"
            || char === "\u2003"
            || char === "\u2004"
            || char === "\u2005"
            || char === "\u2006"
            || char === "\u2007"
            || char === "\u2008"
            || char === "\u2009"
            || char === "\u200A"
            || char === "\u202F"
            || char === "\u205F"
            || char === "\u3000"
            || char === "\u2028"
            || char === "\u2029"
            || char === "\u0009"
            || char === "\u000A"
            || char === "\u000B"
            || char === "\u000C"
            || char === "\u000D"
            || char === "\u0085"
            || char === "\u00A0";
    }

    const charCodeOf0 = "0".charCodeAt(0);
    const charCodeOf9 = "9".charCodeAt(0);

    export function isDigitChar(char: string): boolean {
        const charCode = char.charCodeAt(0);
        return charCode >= charCodeOf0 && charCode <= charCodeOf9;
    }
}