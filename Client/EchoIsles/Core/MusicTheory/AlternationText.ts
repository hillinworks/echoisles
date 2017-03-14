
export module AlternationText {
    export const noAlternationIndex = 0;

    export enum Type {
        Arabic,
        RomanUpper,
        RomanLower
    }

    const alternationTexts = [
        /* Arabic */["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        /* RomanUpper */["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ"],
        /* RomanLower */["ⅰ", "ⅱ", "ⅲ", "ⅳ", "ⅴ", "ⅵ", "ⅶ", "ⅷ", "ⅸ"]
    ];

    const alternationTextIndices: { [key: string]: number } = {};
    const alternationTextTypes: { [key: string]: Type } = {};

    for (let type: Type = 0; type < alternationTexts.length; ++type) {
        alternationTexts[type].forEach((v, i) => alternationTextIndices[v] = i);
        alternationTexts[type].forEach((v) => alternationTextIndices[v] = type);
    }

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

        return alternationTexts[type][index - 1];
    }
}