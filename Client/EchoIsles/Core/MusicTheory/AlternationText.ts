
export module AlternationText {
    export const noAlternationIndex = 0;

    export enum Type {
        Arabic,
        RomanUpper,
        RomanLower
    }

    const standardAlternationTexts = [
        /* Arabic */["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        /* RomanUpper */["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ"],
        /* RomanLower */["ⅰ", "ⅱ", "ⅲ", "ⅳ", "ⅴ", "ⅵ", "ⅶ", "ⅷ", "ⅸ"]
    ];

    const alternationTextIndices: { [key: string]: number } = {};
    const alternationTextTypes: { [key: string]: Type } = {};

    function addAlternationTextSet(textSet: string[], type: Type): void {
        for (let i = 0; i < textSet.length; ++i) {
            const text = textSet[i];
            alternationTextIndices[text] = i;
            alternationTextTypes[text] = type;
        }
    }

    addAlternationTextSet(standardAlternationTexts[0], Type.Arabic);
    addAlternationTextSet(standardAlternationTexts[1], Type.RomanUpper);
    addAlternationTextSet(standardAlternationTexts[2], Type.RomanLower);
    addAlternationTextSet(["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"], Type.RomanUpper);
    addAlternationTextSet(["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"], Type.RomanLower);

    export function parse(text: string): { index: number, type: Type } | undefined {

        const index = alternationTextIndices[text];

        if (index !== undefined) {
            return {
                index: index,
                type: alternationTextTypes[text]
            };
        };

        return undefined;
    }

    export function isValid(text: string): boolean {
        return alternationTextIndices[text] !== undefined;
    }

    export function getAlternationText(type: Type, index: number): string {
        if (index < 1 || index > 9)
            throw new RangeError("index out of range");

        return standardAlternationTexts[type][index - 1];
    }
}