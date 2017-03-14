export module RomanNumerals {
    export function toRoman(number: number): string {
        if ((number < 0) || (number > 3999)) throw new RangeError();
        if (number < 1) return "";
        if (number >= 1000) return `M${toRoman(number - 1000)}`;
        if (number >= 900) return `CM${toRoman(number - 900)}`;
        if (number >= 500) return `D${toRoman(number - 500)}`;
        if (number >= 400) return `CD${toRoman(number - 400)}`;
        if (number >= 100) return `C${toRoman(number - 100)}`;
        if (number >= 90) return `XC${toRoman(number - 90)}`;
        if (number >= 50) return `L${toRoman(number - 50)}`;
        if (number >= 40) return `XL${toRoman(number - 40)}`;
        if (number >= 10) return `X${toRoman(number - 10)}`;
        if (number >= 9) return `IX${toRoman(number - 9)}`;
        if (number >= 5) return `V${toRoman(number - 5)}`;
        if (number >= 4) return `IV${toRoman(number - 4)}`;
        if (number >= 1) return `I${toRoman(number - 1)}`;
        throw new RangeError();
    }
}