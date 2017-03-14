const emptySelector = (e : any) => e.valueOf();

export function min<T>(target: Iterable<T>, selector: (e: T) => number = emptySelector) {
    let min = Number.MAX_VALUE;
    
    for (let item of target) {
        min = Math.min(min, selector(item));
    }

    return min;
}

export function max<T>(target: Iterable<T>, selector: (e: T) => number = emptySelector) {
    let max = Number.MIN_VALUE;
    for (let item of target) {
        max = Math.max(max, selector(item));
    }

    return max;
}

export function sum<T>(target: Iterable<T>, selector: (e: T) => number = emptySelector) {
    let sum = 0;
    for (let item of target) {
        sum += selector(item);
    }

    return sum;
}