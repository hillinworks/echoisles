export type Selector<T, TResult> = (e: T) => TResult;
export type IndexedSelector<T, TResult> = (e: T, index: number) => TResult;
export type Predicate<T> = (e: T) => boolean;
export type IndexedPredicate<T> = (e: T, index: number) => boolean;
export type EqualityComparer<T> = (a: T, b: T) => boolean;
export type Comparer<T> = (a: T, b: T) => number;
export type Hash<T> = (e: T) => number;

type NumberKeyMap<T> = { [key: number]: T };
type StringKeyMap<T> = { [key: string]: T };
type Constructor<T> = new (...args: any[]) => T;

const defaultNumberSelector = (e: any) => e.valueOf();
const defaultSelector = (e: any) => e;
const defaultPredicate = () => true;
const defaultEqualityComparer = (a: any, b: any) => a === b;
const defaultComparer = (a: any, b: any) => a - b;
const defaultHash = (e: any) => e.valueOf();

function invertComparer<T>(comparer: Comparer<T>): Comparer<T> {
    return (a: T, b: T) => -comparer(a, b);
}

function throwEmptySequence(): never {
    throw new Error("empty sequence");
}

function makeHashSet<T>(source: Iterable<T>, hash: Hash<T>): NumberKeyMap<T> {
    const hashSet: NumberKeyMap<T> = {};
    for (let item of source) {
        hashSet[hash(item)] = item;
    }
    return hashSet;
}

/**
 * Applies an accumulator function over a sequence.
 * @param source An Iterable<T> to aggregate over.
 * @param func An accumulator function to be invoked on each element.
 * @return The final accumulator value.
 */
export function aggregate<T>(source: Iterable<T>,
    func: (accumulate: T, current: T) => T): T {
    const iterator = source[Symbol.iterator]();

    const { done, value } = iterator.next();
    if (done) {
        throwEmptySequence();
    }

    let seed = value;

    while (true) {
        const iterateResult = iterator.next();
        if (iterateResult.done) {
            break;
        }

        seed = func(seed, iterateResult.value);
    }

    return seed;
}

/**
 * Applies an accumulator function over a sequence. The specified seed value is used as the initial accumulator value.
 * @param source An Iterable<T> to aggregate over.
 * @param func An accumulator function to be invoked on each element.
 * @param seed The initial accumulator value.
 * @return The final accumulator value.
 */
export function aggregateWithSeed<T, TAccumulate>(source: Iterable<T>,
    seed: TAccumulate, func: (accumulate: TAccumulate, current: T) => TAccumulate): TAccumulate {

    for (let item of source) {
        seed = func(seed, item);
    }

    return seed;
}

/**
 * Determines whether all elements of a sequence satisfy a condition.
 * @param source An Iterable<T> that contains the elements to apply the predicate to.
 * @param predicate A function to test each element for a condition.
 * @return true if every element of the source sequence passes the test in the specified predicate, or if the sequence is empty; otherwise, false.
 */
export function all<T>(source: Iterable<T>, predicate: IndexedPredicate<T>): boolean {
    let i = 0;
    for (let item of source) {
        if (!predicate(item, i)) {
            return false;
        }
        ++i;
    }

    return true;
}

/**
 * Determines whether any element of a sequence satisfies a condition.
 * @param source An Iterable<T> whose elements to apply the predicate to.
 * @param predicate A function to test each element for a condition.
 * @return true if any elements in the source sequence pass the test in the specified predicate; otherwise, false.
 */
export function any<T>(source: Iterable<T>, predicate: IndexedPredicate<T> = defaultPredicate): boolean {
    let i = 0;
    for (let item of source) {
        if (predicate(item, i)) {
            return true;
        }
        ++i;
    }

    return false;
}

/**
 * Append the specified element to a sequence, and return as a new sequence
 * @param source An Iterable<T> to append the element to.
 * @param element The element to append.
 * @return An new Iterable<T> with the specified element appended to the specified sequence.
 */
export function* append<T>(source: Iterable<T>, element: T): Iterable<T> {
    for (let item of source) {
        yield item;
    }
    yield element;
}

/**
 * Computes the average of a sequence of number values that are obtained by invoking a transform function on each element of the input sequence.
 * @param source A sequence of values that are used to calculate an average.
 * @param selector A transform function to apply to each element.
 * @return The average of the sequence of values.
 */
export function average<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector): number {
    let sum = 0;
    let count = 0;
    for (let item of source) {
        sum += selector(item);
        ++count;
    }

    return sum / count;
}

/**
 * Assert the elements of an Iterable<T> as the specified type.
 * @param source The Iterable<T> that contains the elements to be asserted as type TResult.
 * @return An Iterable<TResult> that contains each element of the source sequence asserted to the specified type.
 */
export function* assertType<T, TResult extends T>(source: Iterable<T>): Iterable<TResult> {
    for (let item of source) {
        yield (item as TResult);
    }
}

/**
 * Concatenates two sequences.
 * @param first The first sequence to concatenate.
 * @param second The sequence to concatenate to the first sequence.
 * @return An Iterable<T> that contains the concatenated elements of the two input sequences.
 */
export function* concat<T>(first: Iterable<T>, second: Iterable<T>): Iterable<T> {
    for (let item of first) {
        yield item;
    }
    for (let item of second) {
        yield item;
    }
}


/**
 * Determines whether a sequence contains a specified element by using a specified EqualityComparer<T>.
 * @param source A sequence in which to locate a value.
 * @param value The value to locate in the sequence.
 * @param comparer An equality comparer to compare values.
 * @return true if the source sequence contains an element that has the specified value; otherwise, false.
 */
export function contains<T>(source: Iterable<T>, value: T, comparer: EqualityComparer<T> = defaultEqualityComparer): boolean {
    for (let item of source) {
        if (comparer(item, value)) {
            return true;
        }
    }

    return false;
}

/**
 * Returns a number that represents how many elements in the specified sequence satisfy a condition.
 * @param source A sequence that contains elements to be tested and counted.
 * @param predicate A function to test each element for a condition.
 * @return A number that represents how many elements in the sequence satisfy the condition in the predicate function.
 */
export function count<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): number {
    let count = 0;
    for (let item of source) {
        if (predicate(item)) {
            ++count;
        }
    }

    return count;
}

/**
 * Returns the elements of the specified sequence or the specified value in a singleton collection if the sequence is empty.
 * @param source The sequence to return the specified value for if it is empty.
 * @param defaultValue The value to return if the sequence is empty.
 * @return An Iterable<T> that contains defaultValue if source is empty; otherwise, source.
 */
export function* defaultIfEmpty<T>(source: Iterable<T>, defaultValue: T): Iterable<T> {
    const iterator = source[Symbol.iterator]();
    let iterateResult = iterator.next();
    if (iterateResult.done) {
        yield defaultValue;
    } else {
        yield iterateResult.value;
    }

    while (true) {
        iterateResult = iterator.next();
        if (iterateResult.done) {
            break;
        } else {
            yield iterateResult.value;
        }
    }
}

/**
 * Returns distinct elements from a sequence by using a specified EqualityComparer<T> to compare values.
 * @param source The sequence to remove duplicate elements from.
 * @param comparer An EqualityComparer<T> to compare values.
 * @return An Iterable<T> that contains distinct elements from the source sequence.
 */
export function* distinct<T>(source: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): Iterable<T> {
    const iteratedElements = new Array<T>();

    for (let item of source) {
        if (contains(iteratedElements, item, comparer)) {
            continue;
        }
        iteratedElements.push(item);
        yield item;
    }
}

/**
 * Returns distinct elements from a sequence by using a specified Hash<T> to calculate hash values.
 * @param source The sequence to remove duplicate elements from.
 * @param hash A Hash<T> to calculate hash values.
 * @return An Iterable<T> that contains distinct elements from the source sequence.
 */
export function* distinctHash<T>(source: Iterable<T>, hash: Hash<T> = defaultHash): Iterable<T> {
    const iteratedElements: { [key: number]: T } = {};

    for (let item of source) {
        const hashValue = hash(item);
        if (iteratedElements[hashValue] !== undefined) {
            continue;
        }
        iteratedElements[hashValue] = item;
        yield item;
    }
}

/**
 * Returns the element at a specified index in a sequence.
 * @param source An Iterable<T> to return an element from.
 * @param index The zero-based index of the element to retrieve.
 * @return The element at the specified position in the source sequence.
 */
export function elementAt<T>(source: Iterable<T>, index: number): T {
    const element = elementAtOrUndefined(source, index);

    if (!element) {
        throw new Error("element not existed");
    }

    return element;
}

/**
 * Returns the element at a specified index in a sequence or undefined if the index is out of range.
 * @param source An Iterable<T> to return an element from.
 * @param index The zero-based index of the element to retrieve.
 * @return undefined if the index is outside the bounds of the source sequence; otherwise, the element at the specified position in the source sequence.
 */
export function elementAtOrUndefined<T>(source: Iterable<T>, index: number): T | undefined {
    let currentIndex = 0;
    for (let item of source) {
        if (currentIndex === index) {
            return item;
        }

        ++currentIndex;
    }

    return undefined;
}

/**
 * Produces the set difference of two sequences by using the specified EqualityComparer<T> to compare values.
 * @param first An Iterable<T> whose elements that are not also in second will be returned.
 * @param second An Iterable<T> whose elements that also occur in the first sequence will cause those elements to be removed from the returned
 * @param comparer An EqualityComparer<T> to compare values.
 * @return A sequence that contains the set difference of the elements of two sequences.
 */
export function* except<T>(first: Iterable<T>,
    second: Iterable<T>,
    comparer: EqualityComparer<T> = defaultEqualityComparer): Iterable<T> {
    for (let item of first) {
        if (!contains(second, item, comparer)) {
            yield item;
        }
    }
}

/**
 * Produces the set difference of two sequences by using the specified Hash<T> to calculate hash values.
 * @param first An Iterable<T> whose elements that are not also in second will be returned.
 * @param second An Iterable<T> whose elements that also occur in the first sequence will cause those elements to be removed from the returned
 * @param hash A Hash<T> to calculate hash values.
 * @return A sequence that contains the set difference of the elements of two sequences.
 */
export function* exceptHash<T>(first: Iterable<T>,
    second: Iterable<T>,
    hash: Hash<T> = defaultHash): Iterable<T> {

    const hashedSecond = makeHashSet(second, hash);
    for (let item of first) {
        if (hashedSecond[hash(item)] === undefined) {
            yield item;
        }
    }
}

/**
 * Returns the first element in a sequence that satisfies a specified condition.
 * @param source An Iterable<T> to return an element from.
 * @param predicate A function to test each element for a condition.
 * @return The first element in the sequence that passes the test in the specified predicate function.
 */
export function first<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): T {
    const result = firstOrUndefined(source, predicate);
    if (result === undefined) {
        throwEmptySequence();
    }

    return result!;
}

/**
 * Returns the first element of the sequence that satisfies a condition or undefined if no such element is found.
 * @param source An Iterable<T> to return an element from.
 * @param predicate A function to test each element for a condition.
 * @return undefined if source is empty or if no element passes the test specified by predicate; otherwise, the first element in source that passes the test specified by predicate.
 */
export function firstOrUndefined<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): T | undefined {
    for (let item of source) {
        if (predicate(item)) {
            return item;
        }
    }

    return undefined;
}

/**
 * Represents a collection of objects that have a common key.
 */
export interface IGrouping<TKey, TElement> extends Iterable<TElement> { key: TKey };

class Grouping<TKey, TElement> implements IGrouping<TKey, TElement> {
    readonly array = new Array<TElement>();
    constructor(readonly key: TKey) { }

    [Symbol.iterator](): Iterator<TElement> {
        // ReSharper disable once ImplicitAnyError
        return this.array[Symbol.iterator]();
    }
}

/**
 * Groups the elements of a sequence according to a specified key selector function and projects the elements for each group by using a specified function. A specified EqualityComparer<TKey> is used to compare keys.
 * @param source An Iterable<T> whose elements to group.
 * @param keySelector A function to extract the key for each element.
 * @param elementSelector A function to map each source element to an element in the IGrouping<TKey, TElement>.
 * @param keyComparer An EqualityComparer<TKey> to compare keys.
 * @return An Iterable<IGrouping<TKey, TElement>> where each IGrouping<TKey, TElement> object contains a collection of objects of type TElement and a key.
 */
export function groupBy<TSource, TKey, TElement>(source: Iterable<TSource>,
    keySelector: Selector<TSource, TKey>,
    elementSelector: Selector<TSource, TElement> = defaultSelector,
    keyComparer: EqualityComparer<TKey> = defaultEqualityComparer)
    : Iterable<IGrouping<TKey, TElement>> {

    const groups = new Array<Grouping<TKey, TElement>>();

    for (let item of source) {
        const key = keySelector(item);
        let groupFound = false;
        for (let group of groups) {
            if (keyComparer(key, group.key)) {
                group.array.push(elementSelector(item));
                groupFound = true;
                break;
            }
        }

        if (!groupFound) {
            const group = new Grouping<TKey, TElement>(key);
            group.array.push(elementSelector(item));
            groups.push(group);
        }
    }

    return groups;
}

/**
 * Groups the elements of a sequence according to a specified key selector function and projects the elements for each group by using a specified function. A specified Hash<TKey> is used to calculate key hash values.
 * @param source An Iterable<T> whose elements to group.
 * @param keySelector A function to extract the key for each element.
 * @param elementSelector A function to map each source element to an element in the IGrouping<TKey, TElement>.
 * @param keyHash An Hash<TKey> to calculate key hash values.
 * @return An Iterable<IGrouping<TKey, TElement>> where each IGrouping<TKey, TElement> object contains a collection of objects of type TElement and a key.
 */
export function* groupByHash<TSource, TKey, TElement>(source: Iterable<TSource>,
    keySelector: Selector<TSource, TKey>,
    elementSelector: Selector<TSource, TElement> = defaultSelector,
    keyHash: Hash<TKey> = defaultHash)
    : Iterable<IGrouping<TKey, TElement>> {

    const groups: NumberKeyMap<Grouping<TKey, TElement>> = {};

    for (let item of source) {
        const key = keySelector(item);
        const keyHashValue = keyHash(key);

        if (groups[keyHashValue] === undefined) {
            groups[keyHashValue] = new Grouping<TKey, TElement>(key);
        }

        groups[keyHashValue].array.push(elementSelector(item));
    }

    for (let key in groups) {
        if (groups.hasOwnProperty(key)) {
            yield groups[key];
        }
    }
}

/**
 * Correlates the elements of two sequences based on matching keys.
 * @param outer The first sequence to join.
 * @param inner The sequence to join to the first sequence.
 * @param outerKeySelector A function to extract the join key from each element of the first sequence.
 * @param innerKeySelector A function to extract the join key from each element of the second sequence.
 * @param resultSelector A function to create a result element from two matching elements.
 * @param keyComparer An EqualityComparer<T> to compare keys.
 * @return An Iterable<T> that contains elements of type TResult that are obtained by performing a grouped join on two sequences.
 */
export function* groupJoin<TOuter, TInner, TKey, TResult>(
    outer: Iterable<TOuter>,
    inner: Iterable<TInner>,
    outerKeySelector: Selector<TOuter, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (outer: TOuter, inner: Iterable<TInner>) => TResult,
    keyComparer: EqualityComparer<TKey> = defaultEqualityComparer): Iterable<TResult> {

    for (let outerElement of outer) {
        const outerKey = outerKeySelector(outerElement);

        const innerCollection = new Array<TInner>();
        for (let innerElement of inner) {
            const innerKey = innerKeySelector(innerElement);

            if (keyComparer(outerKey, innerKey)) {
                innerCollection.push(innerElement);
            }
        }

        yield resultSelector(outerElement, innerCollection);
    }
}

/**
 * Produces the set intersection of two sequences by using the specified EqualityComparer<T> to compare values.
 * @param first An Iterable<T> whose distinct elements that also appear in second will be returned.
 * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
 * @param comparer An EqualityComparer<T> to compare values.
 * @return A sequence that contains the elements that form the set intersection of two sequences.
 */
export function* intersect<T>(first: Iterable<T>, second: Iterable<T>, comparer: EqualityComparer<T>): Iterable<T> {
    for (let item of first) {
        if (contains(second, item, comparer)) {
            yield item;
        }
    }
}

/**
 * Produces the set intersection of two sequences by using the specified Hash<T> to calculate hash values.
 * @param first An Iterable<T> whose distinct elements that also appear in second will be returned.
 * @param second An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
 * @param hash An Hash<T> to calculate hash values.
 * @return A sequence that contains the elements that form the set intersection of two sequences.
 */
export function* intersectHash<T>(first: Iterable<T>, second: Iterable<T>, hash: Hash<T>): Iterable<T> {

    const hashedSecond = makeHashSet(second, hash);
    for (let item of first) {
        if (hashedSecond[hash(item)] !== undefined) {
            yield item;
        }
    }
}

/**
 * Correlates the elements of two sequences based on matching keys.
 * @param outer The first sequence to join.
 * @param inner The sequence to join to the first sequence.
 * @param outerKeySelector A function to extract the join key from each element of the first sequence.
 * @param innerKeySelector A function to extract the join key from each element of the second sequence.
 * @param resultSelector A function to create a result element from two matching elements.
 * @param keyComparer An EqualityComparer<T> to compare keys.
 * @return An Iterable<T> that has elements of type TResult that are obtained by performing an inner join on two sequences.
 */
export function* join<TOuter, TInner, TKey, TResult>(
    outer: Iterable<TOuter>,
    inner: Iterable<TInner>,
    outerKeySelector: Selector<TOuter, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (outer: TOuter, inner: TInner) => TResult,
    keyComparer: EqualityComparer<TKey> = defaultEqualityComparer): Iterable<TResult> {

    for (let outerElement of outer) {
        const outerKey = outerKeySelector(outerElement);

        for (let innerElement of inner) {
            const innerKey = innerKeySelector(innerElement);

            if (keyComparer(outerKey, innerKey)) {
                yield resultSelector(outerElement, innerElement);
            }
        }
    }
}


/**
 * Returns the last element of a sequence that satisfies a specified condition.
 * @param source An Iterable<T> or Array<T> to return an element from.
 * @param predicate A function to test each element for a condition.
 * @return The last element in the sequence that passes the test in the specified predicate function.
 */
export function last<T>(source: Iterable<T> | T[], predicate: Predicate<T> = defaultPredicate): T {
    const result = lastOrUndefined(source, predicate);
    if (result === undefined) {
        throw new Error("empty sequence");
    }

    return result;
}

function lastOrUndefinedForArray<T>(source: T[], predicate: Predicate<T> = defaultPredicate): T | undefined {
    for (let i = source.length - 1; i >= 0; --i) {
        const item = source[i];
        if (predicate(item)) {
            return item;
        }
    }

    return undefined;
}

/**
 * Returns the last element of a sequence that satisfies a condition or undefined if no such element is found.
 * @param source An Iterable<T> or Array<T> to return an element from.
 * @param predicate A function to test each element for a condition.
 * @return undefined if the sequence is empty or if no elements pass the test in the predicate function; otherwise, the last element that passes the test in the predicate function.
 */
export function lastOrUndefined<T>(source: Iterable<T> | T[], predicate: Predicate<T> = defaultPredicate): T | undefined {
    if (source instanceof Array) {
        return lastOrUndefinedForArray(source, predicate);
    }

    let last: T | undefined = undefined;
    for (let item of source) {
        if (predicate(item)) {
            last = item;
        }
    }

    return last;
}


/**
 * Invokes a transform function on each element of a sequence and returns the maximum number value.
 * @param source A sequence of values to determine the maximum value of.
 * @param selector A transform function to apply to each element.
 * @return The maximum value in the sequence.
 */
export function max<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector): number {
    let max = Number.MIN_VALUE;
    for (let item of source) {
        max = Math.max(max, selector(item));
    }

    return max;
}


/**
 * Invokes a transform function on each element of a sequence and returns the minimum number value.
 * @param source A sequence of values to determine the minimum value of.
 * @param selector A transform function to apply to each element.
 * @return The minimum value in the sequence.
 */
export function min<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector): number {
    let min = Number.MAX_VALUE;

    for (let item of source) {
        min = Math.min(min, selector(item));
    }

    return min;
}

/**
 * Invokes a transform function on each element of a sequence and returns the minimum and maximum number value.
 * @param source A sequence of values to determine the minimum and maximum value of.
 * @param selector A transform function to apply to each element.
 * @returns The minimum and maximum value in the sequence.
 */
export function minMax<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector)
    : { min: number, max: number } {

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    for (let item of source) {
        const value = selector(item);
        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    return { min, max };
}

/**
 * Filters the elements of a sequence based on a specified type.
 * @param source The Iterable<T> whose elements to filter.
 * @param ctor The constructor function of type TResult to test element types of the sequence.
 * @return An Iterable<T> that contains elements from the input sequence of type TResult.
 */
export function* ofType<T, TResult extends T>(source: Iterable<T>, ctor: Constructor<TResult>): Iterable<TResult> {
    for (let item of source) {
        if (item instanceof ctor) {
            yield item as TResult;
        }
    }
}

export interface IOrderedIterable<T> extends Iterable<T> {
    /**
     * Performs a subsequent ordering of the elements in this sequence in ascending order by using a specified comparer.
     * @param keySelector A function to extract a key from each element.
     * @param comparer An Comparer<T> to compare keys.
     * @returns An IOrderedEnumerable<TElement> whose elements are sorted according to a key.
     */
    thenBy<TKey>(keySelector: Selector<T, TKey>, comparer?: Comparer<TKey>): IOrderedIterable<T>;
    /**
     * Performs a subsequent ordering of the elements in this sequence in descending order by using a specified comparer.
     * @param keySelector A function to extract a key from each element.
     * @param comparer An Comparer<T> to compare keys.
     * @returns An IOrderedEnumerable<TElement> whose elements are sorted in descending according to a key.
     */
    thenByDescending<TKey>(keySelector: Selector<T, TKey>, comparer?: Comparer<TKey>): IOrderedIterable<T>;
}

class OrderInstructions<T> {
    constructor(readonly keySelector: Selector<T, any>, readonly comparer: Comparer<any>) { }
}

class OrderedIterable<T> implements IOrderedIterable<T> {
    constructor(readonly source: T[], readonly instructions: Array<OrderInstructions<T>>) { }

    [Symbol.iterator](): Iterator<T> {

        this.source.sort((a: T, b: T) => {
            let result = 0;
            for (let instruction of this.instructions) {
                result = instruction.comparer(instruction.keySelector(a), instruction.keySelector(b));
                if (result !== 0) {
                    return result;
                }
            }
            return result;
        });

        return this.source[Symbol.iterator]();
    }

    thenBy<TKey>(keySelector: Selector<T, TKey>, comparer: Comparer<TKey> = defaultComparer): OrderedIterable<T> {
        return new OrderedIterable<T>(this.source, [...this.instructions, new OrderInstructions(keySelector, comparer)]);
    }

    thenByDescending<TKey>(keySelector: Selector<T, TKey>,
        comparer: Comparer<TKey> = defaultComparer): OrderedIterable<T> {
        return this.thenBy(keySelector, invertComparer(comparer));
    }
}

/**
 * Sorts the elements of a sequence in ascending order by using a specified comparer.
 * @param source A sequence of values to order.
 * @param keySelector A function to extract a key from an element.
 * @param comparer A Comparer<T> to compare keys.
 * @return An IOrderedIterable<TElement> whose elements are sorted according to a key.
 */
export function orderBy<T, TKey>(source: Iterable<T>,
    keySelector: Selector<T, TKey>,
    comparer: Comparer<TKey> = defaultComparer): IOrderedIterable<T> {
    return new OrderedIterable(toArray(source), [new OrderInstructions(keySelector, comparer)]);
}

/**
 * Sorts the elements of a sequence in descending order by using a specified comparer.
 * @param source A sequence of values to order.
 * @param keySelector A function to extract a key from an element.
 * @param comparer A Comparer<T> to compare keys.
 * @return An IOrderedIterable<TElement> whose elements are sorted in descending according to a key.
 */
export function orderByDescending<T, TKey>(source: Iterable<T>,
    keySelector: Selector<T, TKey>,
    comparer: Comparer<TKey> = defaultComparer): IOrderedIterable<T> {
    return orderBy(source, keySelector, invertComparer(comparer));
}

/**
 * Prepend the specified element to a sequence, and return as a new sequence
 * @param source An Iterable<T> to prepend the element to.
 * @param element The element to prepend.
 * @return An new Iterable<T> with the specified element prepended to the specified sequence.
 */
export function* prepend<T>(source: Iterable<T>, element: T): Iterable<T> {
    yield element;
    for (let item of source) {
        yield item;
    }
}

/**
 * Generates a sequence of integral numbers within a specified range.
 * @param start The value of the first integer in the sequence.
 * @param count The number of sequential integers to generate.
 * @return An Iterable<Int32> that contains a range of sequential integral numbers.
 */
export function* range(start: number, count: number): Iterable<number> {
    for (let i = 0; i < count; ++i) {
        yield i + start;
    }
}

/**
 * Generates a sequence that contains one repeated value.
 * @param element The value to be repeated.
 * @param count The number of times to repeat the value in the generated sequence.
 * @return An Iterable<T> that contains a repeated value.
 */
export function* repeat<T>(element: T, count: number): Iterable<T> {
    for (let i = 0; i < count; ++i) {
        yield element;
    }
}

function* reverseArray<T>(source: T[]): Iterable<T> {
    for (let i = source.length - 1; i >= 0; --i) {
        yield source[i];
    }
}

/**
 * Inverts the order of the elements in a sequence.
 * @param source A sequence of values to reverse.
 * @return A sequence whose elements correspond to those of the input sequence in reverse order.
 */
export function* reverse<T>(source: Iterable<T> | T[]): Iterable<T> {
    if (source instanceof Array) {
        yield* reverseArray(source);
    } else {
        yield* reverseArray(toArray(source));
    }
}

/**
 * Projects each element of a sequence into a new form by optionally incorporating the element's index.
 * @param source A sequence of values to invoke a transform function on.
 * @param selector A transform function to apply to each source element; the optional second parameter of the function represents the index of the source element.
 * @return An Iterator<T> whose elements are the result of invoking the transform function on each element of source.
 */
export function* select<T, TResult>(source: Iterable<T>, selector: IndexedSelector<T, TResult>): Iterable<TResult> {
    let index = 0;
    for (let item of source) {
        yield selector(item, index);
        ++index;
    }
}

/**
 * Projects each element of a sequence to an Iterable<T>, and flattens the resulting sequences into one sequence.
 * @param source A sequence of values to project.
 * @param selector A transform function to apply to each source element; the optional second parameter of the function represents the index of the source element.
 * @return An Iterable<T> whose elements are the result of invoking the one-to-many transform function on each element of an input sequence.
 */
export function* selectMany<T, TResult>(source: Iterable<T>, selector: IndexedSelector<T, Iterable<TResult>>): Iterable<TResult> {
    let index = 0;
    for (let item of source) {
        for (let child of selector(item, index)) {
            yield child;
        }
        ++index;
    }
}

/**
 * Determines whether two sequences are equal by comparing their elements by using a specified EqualityComparer<T>.
 * @param first An IEnumerable<T> to compare to second.
 * @param second An IEnumerable<T> to compare to the first sequence.
 * @param comparer An IEqualityComparer<T> to use to compare elements.
 * @return true if the two source sequences are of equal length and their corresponding elements compare equal according to comparer; otherwise, false.
 */
export function sequenceEqual<T>(first: Iterable<T>,
    second: Iterable<T>,
    comparer: EqualityComparer<T> = defaultEqualityComparer): boolean {
    const firstIterator = first[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();

    while (true) {
        const firstResult = firstIterator.next();
        const secondResult = secondIterator.next();

        if (firstResult.done) {
            return secondResult.done;
        } else if (secondResult.done) {
            return false;
        } else if (!comparer(firstResult.value, secondResult.value)) {
            return false;
        }
    }
}

/**
 * Returns the only element of a sequence that satisfies a specified condition, and throws an exception if more than one such element exists.
 * @param source An Iterable<T> to return a single element from.
 * @param predicate A function to test an element for a condition.
 * @return The single element of the input sequence that satisfies a condition.
 */
export function single<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): T {
    const result = singleOrUndefined(source, predicate);
    if (result === undefined) {
        throw new Error("sequence contains no element that satisfies specified predicate");
    }
    return result;
}

/**
 * Returns the only element of a sequence that satisfies a specified condition or undefined if no such element exists; this method throws an exception if more than one element satisfies the condition.
 * @param source An IEnumerable<T> to return a single element from.
 * @param predicate A function to test an element for a condition.
 * @return The single element of the input sequence that satisfies the condition, or undefined if no such element is found.
 */
export function singleOrUndefined<T>(source: Iterable<T>, predicate: Predicate<T> = defaultPredicate): T | undefined {
    let result: T | undefined = undefined;
    for (let item of source) {
        if (predicate(item)) {
            if (result !== undefined) {
                throw new Error("sequence contains more than one element that satisfies specified predicate");
            }
            result = item;
        }
    }
    return result;
}

/**
 * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
 * @param source An Iterable<T> to return elements from.
 * @param count The number of elements to skip before returning the remaining elements.
 * @return An Iterable<T> that contains the elements that occur after the specified index in the input sequence.
 */
export function* skip<T>(source: Iterable<T>, count: number): Iterable<T> {
    let index = 0;
    for (let item of source) {
        if (index >= count) {
            yield item;
        }
        ++index;
    }
}

/**
 * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.function.
 * @param source An Iterable<T> to return elements from.
 * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
 * @return An Iterable<T> that contains the elements from the input sequence starting at the first element in the linear series that does not pass the test specified by predicate.
 */
export function* skipWhile<T>(source: Iterable<T>, predicate: IndexedPredicate<T>): Iterable<T> {
    let index = 0;
    let skip = true;
    for (let item of source) {
        if (skip) {
            if (predicate(item, index)) {
                ++index;
                continue;
            }
            skip = false;
        }

        yield item;
    }
}

/**
 * Computes the sum of the sequence of number values that are obtained by invoking a transform function on each element of the input sequence.
 * @param source A sequence of values that are used to calculate a sum.
 * @param selector A transform function to apply to each element.
 * @return The sum of the projected values.
 */
export function sum<T>(source: Iterable<T>, selector: Selector<T, number> = defaultNumberSelector): number {
    let sum = 0;
    for (let item of source) {
        sum += selector(item);
    }

    return sum;
}

/**
 * Returns a specified number of contiguous elements from the start of a sequence.
 * @param source The sequence to return elements from.
 * @param count The number of elements to return.
 * @return An Iterable<T> that contains the specified number of elements from the start of the input sequence.
 */
export function* take<T>(source: Iterable<T>, count: number): Iterable<T> {
    let index = 0;
    for (let item of source) {
        if (index < count) {
            yield item;
        } else {
            break;
        }
        ++index;
    }
}

/**
 * Returns elements from a sequence as long as a specified condition is true.
 * @param source The sequence to return elements from.
 * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
 * @return An Iterable<T> that contains elements from the input sequence that occur before the element at which the test no longer passes.
 */
export function* takeWhile<T>(source: Iterable<T>, predicate: IndexedPredicate<T>): Iterable<T> {
    let index = 0;
    for (let item of source) {
        if (predicate(item, index)) {
            yield item;
            ++index;
            continue;
        }
        break;
    }
}

/**
 * Creates an array from a Iterable<T>.
 * @param source An Iterable<T> to create an array from.
 * @return An array that contains the elements from the input sequence.
 */
export function toArray<T>(source: Iterable<T>): T[] {
    return [...source];
}

/**
 * Creates a lookup from an Iterable<T> according to specified key selector and element selector functions.
 * @param source The Iterable<T> to create a lookup from.
 * @param keySelector A function to extract a key from each element.
 * @param valueSelector A transform function to produce a result element value from each element.
 * @return A lookup that contains values of type TElement selected from the input sequence.
 */
export function toLookup<T, TElement>(source: Iterable<T>,
    keySelector: Selector<T, string>,
    valueSelector: Selector<T, TElement>): StringKeyMap<Iterable<TElement>>;
/**
 * Creates a lookup from an Iterable<T> according to specified key selector function.
 * @param source The Iterable<T> to create a lookup from.
 * @param keySelector A function to extract a key from each element.
 * @return A lookup that contains values of type TElement selected from the input sequence.
 */
export function toLookup<T>(source: Iterable<T>, keySelector: Selector<T, string>): StringKeyMap<Iterable<T>>;
export function toLookup<T, TElement>(source: Iterable<T>,
    keySelector: Selector<T, string>,
    valueSelector: Selector<T, TElement> = defaultSelector): StringKeyMap<Iterable<TElement>> {
    const object: StringKeyMap<TElement[]> = {};
    for (let item of source) {
        const key = keySelector(item);
        const value = valueSelector(item);
        if (object[key] === undefined) {
            object[key] = [value];
        } else {
            object[key].push(value);
        }
    }

    return object;
}


/**
 * Creates a map object from a sequence according to specified key selector and element selector functions.
 * @param source An Iterable<T> to create a map object from.
 * @param keySelector A function to extract a string key from each element.
 * @param valueSelector A transform function to produce a result element value from each element.
 * @return A map object that contains values of type TElement selected from the input sequence.
 */
export function toMap<T, TElement>(source: Iterable<T>,
    keySelector: Selector<T, string>,
    valueSelector: Selector<T, TElement>): StringKeyMap<TElement>;
/**
 * Creates a map object from a sequence according to specified key selector function.
 * @param source An Iterable<T> to create a map object from.
 * @param keySelector A function to extract a string key from each element.
 * @return A map object that contains values of type TElement selected from the input sequence.
 */
export function toMap<T>(source: Iterable<T>, keySelector: Selector<T, string>): StringKeyMap<T>;
export function toMap<T, TElement>(source: Iterable<T>,
    keySelector: Selector<T, string>,
    valueSelector: Selector<T, TElement> = defaultSelector): StringKeyMap<TElement> {
    const object: StringKeyMap<TElement> = {};
    for (let item of source) {
        const key = keySelector(item);
        if (object[key] !== undefined) {
            throw new Error("duplicated element");
        }
        object[key] = valueSelector(item);
    }

    return object;
}


/**
 * Returns undefined in a singleton collection if the sequence is empty.
 * @param source The sequence to return a default value for if it is empty.
 * @return An Iterable<T | undefined> object that contains undefined if source is empty; otherwise, source.
 */
export function* undefinedIfEmpty<T>(source: Iterable<T>): Iterable<T | undefined> {
    const iterator = source[Symbol.iterator]();
    let iterateResult = iterator.next();
    if (iterateResult.done) {
        yield undefined;
    } else {
        yield iterateResult.value;
    }

    while (true) {
        iterateResult = iterator.next();
        if (iterateResult.done) {
            break;
        } else {
            yield iterateResult.value;
        }
    }
}

/**
 * Produces the set union of two sequences by using a specified EqualityComparer<T>.
 * @param first An Iterable<T> whose distinct elements form the first set for the union.
 * @param second An Iterable<T> whose distinct elements form the second set for the union.
 * @param comparer The EqualityComparer<T> to compare values.
 * @return An Iterable<T> that contains the elements from both input sequences, excluding duplicates.
 */
export function* union<T>(first: Iterable<T>, second: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): Iterable<T> {
    const items = new Array<T>();
    for (let item of first) {
        if (!contains(items, item, comparer)) {
            items.push(item);
            yield item;
        }
    }
    for (let item of second) {
        if (!contains(items, item, comparer)) {
            items.push(item);
            yield item;
        }
    }
}

/**
 * Produces the set union of two sequences by using a specified Hash<T> to calculate hash values.
 * @param first An Iterable<T> whose distinct elements form the first set for the union.
 * @param second An Iterable<T> whose distinct elements form the second set for the union.
 * @param hash The Hash<T> to calculate hash values.
 * @return An Iterable<T> that contains the elements from both input sequences, excluding duplicates.
 */
export function* unionHash<T>(first: Iterable<T>, second: Iterable<T>, hash: Hash<T> = defaultHash): Iterable<T> {
    const items: NumberKeyMap<T> = {};
    for (let item of first) {
        const hashValue = hash(item);
        if (items[hashValue] === undefined) {
            items[hashValue] = item;
            yield item;
        }
    }
    for (let item of second) {
        const hashValue = hash(item);
        if (items[hashValue] === undefined) {
            items[hashValue] = item;
            yield item;
        }
    }
}


/**
 * Returns the elements of the sequence that has the maximum value calculated by the specified selector.
 * @param source An Iterable<T> to find element from.
 * @param selector A transform function to apply to each element.
 * @return an array of elements from the input sequence that has the maximum value calculated by the specified selector.
 */
export function withMax<T>(source: Iterable<T>, selector: Selector<T, number>): T[] {
    let max = Number.MIN_VALUE;
    let elements = new Array<T>();
    for (let item of source) {
        const value = selector(item);
        if (max < value) {
            max = value;
            elements = [item];
        } else if (max === value) {
            elements.push(item);
        }
    }

    return elements;
}

/**
 * Returns the elements of the sequence that has the minimum value calculated by the specified selector.
 * @param source An Iterable<T> to find element from.
 * @param selector A transform function to apply to each element.
 * @return an array of elements from the input sequence that has the minimum value calculated by the specified selector.
 */
export function withMin<T>(source: Iterable<T>, selector: Selector<T, number>): T[] {
    let min = Number.MAX_VALUE;
    let elements = new Array<T>();
    for (let item of source) {
        const value = selector(item);
        if (min > value) {
            min = value;
            elements = [item];
        } else if (min === value) {
            elements.push(item);
        }
    }

    return elements;
}

/**
 * Filters a sequence of values based on a predicate.
 * @param source An Iterable<T> to filter.
 * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
 * @return An Iterable<T> that contains elements from the input sequence that satisfy the condition.
 */
export function* where<T>(source: Iterable<T>, predicate: IndexedPredicate<T>): Iterable<T> {
    let index = 0;
    for (let item of source) {
        if (predicate(item, index)) {
            yield item;
        }
        ++index;
    }
}

/**
 * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
 * @param first The first sequence to merge.
 * @param second The second sequence to merge.
 * @param resultSelector A function that specifies how to merge the elements from the two sequences.
 * @return An Iterable<T> that contains merged elements of two input sequences.
 */
export function* zip<TFirst, TSecond, TResult>(first: Iterable<TFirst>,
    second: Iterable<TSecond>,
    resultSelector: (first: TFirst, second: TSecond) => TResult)
    : Iterable<TResult> {

    const firstIterator = first[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();

    while (true) {
        const firstResult = firstIterator.next();
        const secondResult = secondIterator.next();

        if (firstResult.done || secondResult.done) {
            break;
        }

        yield resultSelector(firstResult.value, secondResult.value);
    }

}

export interface ISequence<T> extends Iterable<T> {
    /**
     * Applies an accumulator function over this sequence.
     * @param func An accumulator function to be invoked on each element.
     * @return The final accumulator value.
     */
    aggregate(func: (accumulate: T, current: T) => T): T;
    /**
     * Applies an accumulator function over this sequence. The specified seed value is used as the initial accumulator value.
     * @param func An accumulator function to be invoked on each element.
     * @param seed The initial accumulator value.
     * @return The final accumulator value.
     */
    aggregateWithSeed<TAccumulate>(seed: TAccumulate, func?: (accumulate: TAccumulate, current: T) => TAccumulate):
        TAccumulate;
    /**
     * Determines whether all elements of this sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     * @return true if every element of the source sequence passes the test in the specified predicate, or if the sequence is empty; otherwise, false.
     */
    all(predicate: IndexedPredicate<T>): boolean;
    /**
     * Determines whether any element of this  sequence satisfies a condition.
     * @param predicate A function to test each element for a condition.
     * @return true if any elements in the source sequence pass the test in the specified predicate; otherwise, false.
     */
    any(predicate?: IndexedPredicate<T>): boolean;

    /**
     * Append the specified element to this sequence, and return as a new sequence
     * @param element The element to append.
     * @return An new Iterable<T> with the specified element appended to this sequence.
     */
    append(element: T): Iterable<T>;

    /**
     * Assert the elements of this sequence as the specified type.
     * @param source The Iterable<T> that contains the elements to be asserted as type TResult.
     * @return A sequence<TResult> that contains each element of the source sequence asserted to the specified type.
     */
    assertType<TResult extends T>(): ISequence<TResult>;

    /**
     * Computes the average of this sequence of number values that are obtained by invoking a transform function on each element of the input sequence.
     * @param selector A transform function to apply to each element.
     * @return The average of the sequence of values.
     */
    average(selector?: Selector<T, number>): number;


    /**
     * Concatenates this sequence with another sequence.
     * @param other The sequence to concatenate to this sequence.
     * @return A sequence<T> that contains the concatenated elements of the two input sequences.
     */
    concat(other: Iterable<T>): ISequence<T>;
    /**
     * Determines whether this sequence contains a specified element by using a specified EqualityComparer<T>.
     * @param value The value to locate in the sequence.
     * @param comparer An equality comparer to compare values.
     * @return true if this sequence contains an element that has the specified value; otherwise, false.
     */
    contains(value: T, comparer?: EqualityComparer<T>): boolean;
    /**
     * Returns a number that represents how many elements in this sequence satisfy a condition.
     * @param predicate A function to test each element for a condition.
     * @return A number that represents how many elements in this sequence satisfy the condition in the predicate function.
     */
    count(predicate: Predicate<T>): number;

    /**
     * Returns the elements of this sequence or the specified value in a singleton collection if the sequence is empty.
     * @param defaultValue The value to return if this sequence is empty.
     * @return A sequence<T> that contains defaultValue if source is empty; otherwise, source.
     */
    defaultIfEmpty(defaultValue: T): ISequence<T>;
    /**
     * Returns distinct elements from this sequence by using a specified EqualityComparer<T> to compare values.
     * @param comparer An EqualityComparer<T> to compare values.
     * @return A sequence<T> that contains distinct elements from this sequence.
     */
    distinct(comparer?: EqualityComparer<T>): ISequence<T>;
    /**
     * Returns distinct elements from this sequence by using a specified Hash<T> to calculate hash values.
     * @param hash A Hash<T> to calculate hash values.
     * @return A sequence<T> that contains distinct elements from the source sequence.
     */
    distinctHash(hash?: Hash<T>): ISequence<T>;
    /**
     * Returns the element at a specified index in this sequence.
     * @param index The zero-based index of the element to retrieve.
     * @return The element at the specified position in the this sequence.
     */
    elementAt(index: number): T;
    /**
     * Returns the element at a specified index in this sequence or undefined if the index is out of range.
     * @param index The zero-based index of the element to retrieve.
     * @return undefined if the index is outside the bounds of this sequence; otherwise, the element at the specified position in this sequence.
     */
    elementAtOrUndefined(index: number): T | undefined;

    /**
     * Produces the set difference of this and another sequence by using the specified EqualityComparer<T> to compare values.
     * @param other An Iterable<T> whose elements that also occur in the this sequence will cause those elements to be removed from the returned
     * @param comparer An EqualityComparer<T> to compare values.
     * @return A sequence that contains the set difference of the elements of this and ther other sequences.
     */
    except(other: Iterable<T>, comparer?: EqualityComparer<T>): ISequence<T>;
    /**
     * Produces the set difference of this and another sequence by using the specified Hash<T> to calculate hash values.
     * @param other An Iterable<T> whose elements that also occur in the this sequence will cause those elements to be removed from the returned
     * @param hash A Hash<T> to calculate hash values.
     * @return A sequence that contains the set difference of the elements of this and ther other sequences.
     */
    exceptHash(other: Iterable<T>, hash?: Hash<T>): ISequence<T>;
    /**
     * Returns the first element in this sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition.
     * @return The first element in this sequence that passes the test in the specified predicate function.
     */
    first(predicate?: Predicate<T>): T;
    /**
     * Returns the first element of this sequence that satisfies a condition or undefined if no such element is found.
     * @param predicate A function to test each element for a condition.
     * @return undefined if this sequence is empty or if no element passes the test specified by predicate; otherwise, the first element in this sequence that passes the test specified by predicate.
     */
    firstOrUndefined(predicate?: Predicate<T>): T | undefined;

    /**
     * Iterate through this sequence and perform the specified action on each element.
     * @param action the action to apply to each element.
     */
    foreach(action: (element: T, index: number) => void): void;

    /**
     * Groups the elements of this sequence according to a specified key selector function and projects the elements for each group by using a specified function.
     * A specified EqualityComparer<TKey> is used to compare keys.
     * @param keySelector A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in the IGrouping<TKey, TElement>.
     * @param keyComparer An EqualityComparer<TKey> to compare keys.
     * @return A sequence<IGrouping<TKey, TElement>> where each IGrouping<TKey, TElement> object contains a collection of objects of type TElement and a key.
     */
    groupBy<TSource, TKey, TElement>(keySelector: Selector<TSource, TKey>,
        elementSelector?: Selector<TSource, TElement>,
        keyComparer?: EqualityComparer<TKey>)
        : ISequence<IGrouping<TKey, TElement>>;


    /**
     * Groups the elements of this sequence according to a specified key selector function and projects the elements for each group by using a specified function.
     * A specified Hash<TKey> is used to calculate key hash values.
     * @param keySelector A function to extract the key for each element.
     * @param elementSelector A function to map each source element to an element in the IGrouping<TKey, TElement>.
     * @param keyHash An Hash<TKey> to calculate key hash values.
     * @return A sequence<IGrouping<TKey, TElement>> where each IGrouping<TKey, TElement> object contains a collection of objects of type TElement and a key.
     */
    groupByHash<TSource, TKey, TElement>(keySelector: Selector<TSource, TKey>,
        elementSelector?: Selector<TSource, TElement>,
        keyHash?: Hash<TKey>)
        : ISequence<IGrouping<TKey, TElement>>;


    /**
     * Correlates the elements of this and another sequence based on matching keys.
     * @param inner The sequence to join to the first sequence.
     * @param outerKeySelector A function to extract the join key from each element of the first sequence.
     * @param innerKeySelector A function to extract the join key from each element of the second sequence.
     * @param resultSelector A function to create a result element from two matching elements.
     * @param keyComparer An EqualityComparer<T> to compare keys.
     * @return An ISequence<T> that contains elements of type TResult that are obtained by performing a grouped join on two sequences.
     */
    groupJoin<TInner, TKey, TResult>(
        inner: Iterable<TInner>,
        outerKeySelector: Selector<T, TKey>,
        innerKeySelector: Selector<TInner, TKey>,
        resultSelector: (outer: T, inner: Iterable<TInner>) => TResult,
        keyComparer?: EqualityComparer<TKey>): ISequence<TResult>;

    /**
     * Produces the set intersection of this and another sequence by using the specified EqualityComparer<T> to compare values.
     * @param other An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param comparer An EqualityComparer<T> to compare values.
     * @return A sequence that contains the elements that form the set intersection of this and the other sequences.
     */
    intersect(other: Iterable<T>, comparer?: EqualityComparer<T>): ISequence<T>;
    /**
     * Produces the set intersection of this and another sequence by using the specified Hash<T> to calculate hash values.
     * @param other An Iterable<T> whose distinct elements that also appear in the first sequence will be returned.
     * @param hash An Hash<T> to calculate hash values.
     * @return A sequence that contains the elements that form the set intersection of this and the other sequences.
     */
    intersectHash(other: Iterable<T>, hash?: Hash<T>): ISequence<T>;
    /**
     * Correlates the elements of this and another sequence based on matching keys.
     * @param inner The sequence to join to the first sequence.
     * @param outerKeySelector A function to extract the join key from each element of the first sequence.
     * @param innerKeySelector A function to extract the join key from each element of the second sequence.
     * @param resultSelector A function to create a result element from two matching elements.
     * @param keyComparer An EqualityComparer<T> to compare keys.
     * @return An ISequence<T> that has elements of type TResult that are obtained by performing an inner join on two sequences.
     */
    join<TInner, TKey, TResult>(
        inner: Iterable<TInner>,
        outerKeySelector: Selector<T, TKey>,
        innerKeySelector: Selector<TInner, TKey>,
        resultSelector: (outer: T, inner: TInner) => TResult,
        keyComparer?: EqualityComparer<TKey>): ISequence<TResult>;

    /**
     * Returns the last element of this sequence that satisfies a specified condition.
     * @param predicate A function to test each element for a condition.
     * @return The last element in this sequence that passes the test in the specified predicate function.
     */
    last(predicate?: Predicate<T>): T;
    /**
     * Returns the last element of this sequence that satisfies a condition or undefined if no such element is found.
     * @param predicate A function to test each element for a condition.
     * @return undefined if this sequence is empty or if no elements pass the test in the predicate function; otherwise, the last element that passes the test in the predicate function.
     */
    lastOrUndefined(predicate?: Predicate<T>): T | undefined;
    /**
     * Invokes a transform function on each element of this sequence and returns the maximum number value.
     * @param selector A transform function to apply to each element.
     * @return The maximum value in this sequence.
     */
    max(selector?: Selector<T, number>): number;
    /**
     * Invokes a transform function on each element of this sequence and returns the minimum number value.
     * @param selector A transform function to apply to each element.
     * @return The minimum value in this sequence.
     */
    min(selector?: Selector<T, number>): number;
    /**
     * Invokes a transform function on each element of this sequence and returns the minimum and maximum number value.
     * @param selector A transform function to apply to each element.
     * @returns The minimum and maximum value in this sequence.
     */
    minMax(selector?: Selector<T, number>): { min: number, max: number };
    /**
     * Filters the elements of this sequence based on a specified type.
     * @param ctor The constructor function of type TResult to test element types of this sequence.
     * @return A sequence<T> that contains elements from this sequence of type TResult.
     */
    ofType<TResult extends T>(ctor: Constructor<TResult>): ISequence<TResult>;

    /**
     * Sorts the elements of this sequence in ascending order by using a specified comparer.
     * @param keySelector A function to extract a key from an element.
     * @param comparer A Comparer<T> to compare keys.
     * @return An IOrderedIterable<TElement> whose elements are sorted according to a key.
     */
    orderBy<TKey>(keySelector: Selector<T, TKey>,
        comparer?: Comparer<TKey>): IOrderedSequence<T>;

    /**
     * Sorts the elements of this sequence in descending order by using a specified comparer.
     * @param keySelector A function to extract a key from an element.
     * @param comparer A Comparer<T> to compare keys.
     * @return An IOrderedIterable<TElement> whose elements are sorted in descending according to a key.
     */
    orderByDescending<TKey>(keySelector: Selector<T, TKey>,
        comparer?: Comparer<TKey>): IOrderedSequence<T>;

    /**
     * Prepend the specified element to this sequence, and return as a new sequence
     * @param element The element to prepend.
     * @return An new Iterable<T> with the specified element prepended to this sequence.
     */
    prepend(element: T): Iterable<T>;

    /**
     * Inverts the order of this elements in a sequence.
     * @return A sequence whose elements correspond to those of this input sequence in reverse order.
     */
    reverse(): ISequence<T>;
    /**
     * Projects each element of this sequence into a new form by optionally incorporating the element's index.
     * @param selector A transform function to apply to each element; the optional second parameter of the function represents the index of the element.
     * @return An Iterator<T> whose elements are the result of invoking the transform function on each element of source.
     */
    select<TResult>(selector?: IndexedSelector<T, TResult>): ISequence<TResult>;
    /**
     * Projects each element of this sequence to an Iterable<TResult>, and flattens the resulting sequences into one sequence.
     * @param selector A transform function to apply to each element; the optional second parameter of the function represents the index of the element.
     * @return A sequence<T> whose elements are the result of invoking the one-to-many transform function on each element of this sequence.
     */
    selectMany<TResult>(selector?: IndexedSelector<T, Iterable<TResult>>): ISequence<TResult>;
    /**
     * Determines whether this sequence is equal to another by comparing their elements by using a specified EqualityComparer<T>.
     * @param other The Iterable<T> to compare to this sequence.
     * @param comparer An EqualityComparer<T> to use to compare elements.
     * @return true if the two source sequences are of equal length and their corresponding elements compare equal according to comparer; otherwise, false.
     */
    sequenceEqual(other: Iterable<T>, comparer?: EqualityComparer<T>): boolean;
    /**
     * Returns the only element of this sequence that satisfies a specified condition, and throws an exception if more than one such element exists.
     * @param predicate A function to test an element for a condition.
     * @return The single element of this sequence that satisfies a condition.
     */
    single(predicate?: Predicate<T>): T;
    /**
     * Returns the only element of this sequence that satisfies a specified condition or undefined if no such element exists; this method throws an exception if more than one element satisfies the condition.
     * @param predicate A function to test an element for a condition.
     * @return The single element of this sequence that satisfies the condition, or undefined if no such element is found.
     */
    singleOrUndefined(predicate?: Predicate<T>): T | undefined;
    /**
     * Bypasses a specified number of elements in this sequence and then returns the remaining elements.
     * @param count The number of elements to skip before returning the remaining elements.
     * @return A sequence<T> that contains the elements that occur after the specified index in this sequence.
     */
    skip(count: number): ISequence<T>;
    /**
     * Bypasses elements in this sequence as long as a specified condition is true and then returns the remaining elements.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     * @return A sequence<T> that contains the elements from this sequence starting at the first element in the linear series that does not pass the test specified by predicate.
     */
    skipWhile(predicate: IndexedPredicate<T>): ISequence<T>;
    /**
     * Computes the sum of the sequence of number values that are obtained by invoking a transform function on each element of this sequence.
     * @param selector A transform function to apply to each element.
     * @return The sum of the projected values.
     */
    sum(selector?: Selector<T, number>): number;
    /**
     * Returns a specified number of contiguous elements from the start of this sequence.
     * @param count The number of elements to return.
     * @return A sequence<T> that contains the specified number of elements from the start of this sequence.
     */
    take(count: number): ISequence<T>;
    /**
     * Returns elements from this sequence as long as a specified condition is true.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     * @return An Iterable<T> that contains elements from the input sequence that occur before the element at which the test no longer passes.
     */
    takeWhile(predicate: IndexedPredicate<T>): ISequence<T>;
    /**
     * Creates an array from this sequence.
     * @return An array that contains the elements from this sequence.
     */
    toArray(): T[];

    /**
     * Creates a lookup from this sequence according to specified key selector function.
     * @param keySelector A function to extract a key from each element.
     * @return A lookup that contains values of type TElement selected from this sequence.
     */
    toLookup(keySelector: Selector<T, string>): StringKeyMap<ISequence<T>>;
    /**
     * Creates a lookup from this sequence according to specified key selector and element selector functions.
     * @param keySelector A function to extract a key from each element.
     * @param valueSelector A transform function to produce a result element value from each element.
     * @return A lookup that contains values of type TElement selected from this sequence.
     */
    toLookup<TElement>(keySelector: Selector<T, string>,
        valueSelector: Selector<T, TElement>): StringKeyMap<ISequence<TElement>>;

    /**
     * Creates a map object from this sequence according to specified key selector function.
     * @param keySelector A function to extract a string key from each element.
     * @return A map object that contains values of type TElement selected from this sequence.
     */
    toMap(keySelector: Selector<T, string>): StringKeyMap<T>;
    /**
     * Creates a map object from this sequence according to specified key selector and element selector functions.
     * @param keySelector A function to extract a string key from each element.
     * @param valueSelector A transform function to produce a result element value from each element.
     * @return A map object that contains values of type TElement selected from this sequence.
     */
    toMap<TElement>(keySelector: Selector<T, string>,
        valueSelector: Selector<T, TElement>): StringKeyMap<TElement>;

    /**
     * Returns undefined in a singleton collection if this sequence is empty.
     * @return An Iterable<T | undefined> object that contains undefined if this sequence is empty; otherwise, this sequence.
     */
    undefinedIfEmpty(): ISequence<T | undefined>;

    /**
     * Produces the set union of this and another sequence by using a specified EqualityComparer<T>.
     * @param other An Iterable<T> whose distinct elements form the other set for the union.
     * @param comparer The EqualityComparer<T> to compare values.
     * @return A sequence<T> that contains the elements from both input sequences, excluding duplicates.
     */
    union(other: Iterable<T>, comparer?: EqualityComparer<T>): ISequence<T>;
    /**
     * Produces the set union of this and another sequence by using a specified Hash<T> to calculate hash values.
     * @param other An Iterable<T> whose distinct elements form the other set for the union.
     * @param hash The Hash<T> to calculate hash values.
     * @return An Iterable<T> that contains the elements from both input sequences, excluding duplicates.
     */
    unionHash(other: Iterable<T>, hash?: Hash<T>): ISequence<T>;

    /**
     * Returns the elements of this sequence that has the maximum value calculated by the specified selector.
     * @param selector A transform function to apply to each element.
     * @return an array of elements from this sequence that has the maximum value calculated by the specified selector.
     */
    withMax(selector: Selector<T, number>): ISequence<T>;

    /**
     * Returns the elements of this sequence that has the minimum value calculated by the specified selector.
     * @param selector A transform function to apply to each element.
     * @return an array of elements from this sequence that has the minimum value calculated by the specified selector.
     */
    withMin(selector: Selector<T, number>): ISequence<T>;

    /**
     * Filters this sequence of values based on a predicate.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     * @return An Iterable<T> that contains elements from this sequence that satisfy the condition.
     */
    where(predicate: IndexedPredicate<T>): ISequence<T>;
    /**
     * Applies a specified function to the corresponding elements of this and another sequences, producing a sequence of the results.
     * @param second The other sequence to merge.
     * @param resultSelector A function that specifies how to merge the elements from the two sequences.
     * @return A sequence<T> that contains merged elements of two input sequences.
     */
    zip<TSecond, TResult>(other: Iterable<TSecond>, resultSelector: (first: T, other: TSecond) => TResult):
        ISequence<TResult>;
}


class Sequence<T> implements ISequence<T> {

    constructor(private readonly iterable: Iterable<T>) {

    }

    [Symbol.iterator](): Iterator<T> {
        // ReSharper disable once ImplicitAnyError
        return this.iterable[Symbol.iterator]();
    }

    aggregate(func: (accumulate: T, current: T) => T): T {
        return aggregate(this.iterable, func);
    }

    aggregateWithSeed<TAccumulate>(seed: TAccumulate, func: (accumulate: TAccumulate, current: T) => TAccumulate)
        : TAccumulate {
        return aggregateWithSeed(this.iterable, seed, func);
    }

    all(predicate: IndexedPredicate<T>): boolean {
        return all(this.iterable, predicate);
    }

    any(predicate: IndexedPredicate<T> = defaultPredicate): boolean {
        return any(this.iterable, predicate);
    }

    append(element: T): Iterable<T> {
        return new Sequence<T>(append(this.iterable, element));
    }

    assertType<TResult extends T>(): ISequence<TResult> {
        return new Sequence(assertType<T, TResult>(this.iterable));
    }

    average(selector: Selector<T, number> = defaultNumberSelector): number {
        return average(this.iterable, selector);
    }

    concat(other: Iterable<T>): ISequence<T> {
        return new Sequence<T>(concat(this.iterable, other));
    }

    contains(value: T, comparer: EqualityComparer<T> = defaultEqualityComparer): boolean {
        return contains(this.iterable, value, comparer);
    }

    count(predicate: Predicate<T> = defaultPredicate): number {
        return count(this.iterable);
    }

    defaultIfEmpty(defaultValue: T): ISequence<T> {
        return new Sequence<T>(defaultIfEmpty(this.iterable, defaultValue));
    }

    distinct(comparer: EqualityComparer<T> = defaultEqualityComparer): ISequence<T> {
        return new Sequence<T>(distinct(this.iterable));
    }

    distinctHash(hash: Hash<T> = defaultHash): ISequence<T> {
        return new Sequence<T>(distinctHash(this.iterable, hash));
    }

    elementAt(index: number): T {
        return elementAt(this.iterable, index);
    }

    elementAtOrUndefined(index: number): T | undefined {
        return elementAtOrUndefined(this.iterable, index);
    }

    except(other: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): ISequence<T> {
        return new Sequence<T>(except(this.iterable, other, comparer));
    }

    exceptHash(other: Iterable<T>, hash: Hash<T> = defaultHash): ISequence<T> {
        return new Sequence<T>(exceptHash(this.iterable, other, hash));
    }

    first(predicate: Predicate<T> = defaultPredicate): T {
        return first(this.iterable, predicate);
    }

    firstOrUndefined(predicate: Predicate<T> = defaultPredicate): T | undefined {
        return firstOrUndefined(this.iterable, predicate);
    }

    foreach(action: (element: T, index: number) => void): void {
        let index = 0;
        for (let item of this.iterable) {
            action(item, index);
            ++index;
        }
    }

    groupBy<TKey, TElement>(keySelector: Selector<T, TKey>,
        elementSelector: Selector<T, TElement> = defaultSelector,
        keyComparer: EqualityComparer<TKey> = defaultEqualityComparer): ISequence<IGrouping<TKey, TElement>> {
        const groups = groupBy<T, TKey, TElement>(this.iterable, keySelector, elementSelector, keyComparer);
        return new Sequence<IGroupingSequence<TKey, TElement>>(select(groups, g => new GroupingSequence<TKey, TElement>(g)));
    }

    groupByHash<TKey, TElement>(keySelector: Selector<T, TKey>,
        elementSelector: Selector<T, TElement> = defaultSelector,
        keyHash: Hash<TKey> = defaultHash): ISequence<IGrouping<TKey, TElement>> {
        const groups = groupByHash<T, TKey, TElement>(this.iterable, keySelector, elementSelector, keyHash);
        return new Sequence<IGroupingSequence<TKey, TElement>>(select(groups, g => new GroupingSequence<TKey, TElement>(g)));
    }

    groupJoin<TInner, TKey, TResult>(
        inner: Iterable<TInner>,
        outerKeySelector: Selector<T, TKey>,
        innerKeySelector: Selector<TInner, TKey>,
        resultSelector: (outer: T, inner: Iterable<TInner>) => TResult,
        keyComparer: EqualityComparer<TKey> = defaultEqualityComparer): ISequence<TResult> {
        return new Sequence<TResult>(groupJoin(this.iterable,
            inner,
            outerKeySelector,
            innerKeySelector,
            resultSelector,
            keyComparer));
    }

    intersect(other: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): ISequence<T> {
        return new Sequence<T>(intersect(this.iterable, other, comparer));
    }

    intersectHash(other: Iterable<T>, hash: Hash<T> = defaultHash): ISequence<T> {
        return new Sequence<T>(intersectHash(this.iterable, other, hash));
    }

    join<TInner, TKey, TResult>(
        inner: Iterable<TInner>,
        outerKeySelector: Selector<T, TKey>,
        innerKeySelector: Selector<TInner, TKey>,
        resultSelector: (outer: T, inner: TInner) => TResult,
        keyComparer: EqualityComparer<TKey> = defaultEqualityComparer): ISequence<TResult> {
        return new Sequence<TResult>(join(this.iterable,
            inner,
            outerKeySelector,
            innerKeySelector,
            resultSelector,
            keyComparer));
    }

    last(predicate: Predicate<T> = defaultPredicate): T {
        return last(this.iterable, predicate);
    }

    lastOrUndefined(predicate: Predicate<T> = defaultPredicate): T | undefined {
        return lastOrUndefined(this.iterable, predicate);
    }

    max(selector: Selector<T, number> = defaultNumberSelector): number {
        return max(this.iterable, selector);
    }

    min(selector: Selector<T, number> = defaultNumberSelector): number {
        return min(this.iterable, selector);
    }

    minMax(selector: Selector<T, number> = defaultNumberSelector): { min: number, max: number } {
        return minMax(this.iterable, selector);
    }

    ofType<TResult extends T>(ctor: Constructor<TResult>): ISequence<TResult> {
        return new Sequence(ofType(this.iterable, ctor));
    }

    orderBy<TKey>(keySelector: Selector<T, TKey>,
        comparer: Comparer<TKey> = defaultComparer): IOrderedSequence<T> {
        return new OrderedSequence(orderBy(this.iterable, keySelector, comparer));
    }

    orderByDescending<TKey>(keySelector: Selector<T, TKey>,
        comparer: Comparer<TKey> = defaultComparer): IOrderedSequence<T> {
        return new OrderedSequence(orderByDescending(this.iterable, keySelector, comparer));
    }

    prepend(element: T): Iterable<T> {
        return new Sequence<T>(prepend(this.iterable, element));
    }

    reverse(): ISequence<T> {
        return new Sequence<T>(reverse(this.iterable));
    }

    select<TResult>(selector: IndexedSelector<T, TResult>): ISequence<TResult> {
        return new Sequence<TResult>(select(this.iterable, selector));
    }

    selectMany<TResult>(selector: IndexedSelector<T, Iterable<TResult>>): ISequence<TResult> {
        return new Sequence(selectMany(this.iterable, selector));
    }

    sequenceEqual(other: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): boolean {
        return sequenceEqual(this.iterable, other, comparer);
    }

    single(predicate: Predicate<T> = defaultPredicate): T {
        return single(this.iterable, predicate);
    }

    singleOrUndefined(predicate: Predicate<T> = defaultPredicate): T | undefined {
        return singleOrUndefined(this.iterable, predicate);
    }

    skip(count: number): ISequence<T> {
        return new Sequence<T>(skip(this.iterable, count));
    }

    skipWhile(predicate: IndexedPredicate<T>): ISequence<T> {
        return new Sequence<T>(skipWhile(this.iterable, predicate));
    }

    sum(selector: Selector<T, number> = defaultNumberSelector): number {
        return sum(this.iterable, selector);
    }

    take(count: number): ISequence<T> {
        return new Sequence<T>(take(this.iterable, count));
    }

    takeWhile(predicate: IndexedPredicate<T>): ISequence<T> {
        return new Sequence<T>(takeWhile(this.iterable, predicate));
    }

    toArray(): T[] {
        return toArray(this.iterable);
    }

    toLookup<TElement>(keySelector: Selector<T, string>,
        valueSelector: Selector<T, TElement>): StringKeyMap<ISequence<TElement>>;
    toLookup(keySelector: Selector<T, string>): StringKeyMap<ISequence<T>>;
    toLookup<TElement>(keySelector: Selector<T, string>,
        valueSelector: Selector<T, TElement> = defaultSelector): StringKeyMap<ISequence<TElement>> {
        const rawLookup = toLookup<T, TElement>(this.iterable, keySelector, valueSelector);
        const lookup: StringKeyMap<ISequence<TElement>> = {};
        for (let key in rawLookup) {
            if (rawLookup.hasOwnProperty(key)) {
                lookup[key] = new Sequence<TElement>(rawLookup[key]);
            }
        }

        return lookup;
    }
    toMap<TElement>(keySelector: Selector<T, string>,
        valueSelector: Selector<T, TElement>): StringKeyMap<TElement>;
    toMap(keySelector: Selector<T, string>): StringKeyMap<T>;
    toMap<TElement>(keySelector: Selector<T, string>,
        valueSelector: Selector<T, TElement> = defaultSelector): StringKeyMap<TElement> {
        return toMap(this.iterable, keySelector, valueSelector);
    }

    undefinedIfEmpty(): ISequence<T | undefined> {
        return new Sequence<T | undefined>(undefinedIfEmpty(this.iterable));
    }

    union(other: Iterable<T>, comparer: EqualityComparer<T> = defaultEqualityComparer): ISequence<T> {
        return new Sequence<T>(union(this.iterable, other, comparer));
    }

    unionHash(other: Iterable<T>, hash: Hash<T> = defaultHash): ISequence<T> {
        return new Sequence<T>(unionHash(this.iterable, other, hash));
    }

    withMin(selector: Selector<T, number>): ISequence<T> {
        return new Sequence<T>(withMin(this.iterable, selector));
    }

    withMax(selector: Selector<T, number>): ISequence<T> {
        return new Sequence<T>(withMax(this.iterable, selector));
    }

    where(predicate: IndexedPredicate<T>): ISequence<T> {
        return new Sequence<T>(where(this.iterable, predicate));
    }

    zip<TSecond, TResult>(other: Iterable<TSecond>, resultSelector: (first: T, other: TSecond) => TResult):
        ISequence<TResult> {
        return new Sequence(zip(this.iterable, other, resultSelector));
    }
}

const outerRange = range;
const outerRepeat = repeat;

// ReSharper disable once InconsistentNaming
export module ISequence {
    /**
     * Generates a sequence of integral numbers within a specified range.
     * @param start The value of the first integer in the sequence.
     * @param count The number of sequential integers to generate.
     * @return An ISequence<Int32> that contains a range of sequential integral numbers.
     */
    export function range(start: number, count: number): ISequence<number> {
        return new Sequence<number>(outerRange(start, count));
    }

    /**
     * Generates a sequence that contains one repeated value.
     * @param element The value to be repeated.
     * @param count The number of times to repeat the value in the generated sequence.
     * @return An ISequence<T> that contains a repeated value.
     */
    export function repeat<T>(element: T, count: number): ISequence<T> {
        return new Sequence<T>(outerRepeat(element, count));
    }
}

/**
 * Represents a sequence of objects that have a common key.
 */
export interface IGroupingSequence<TKey, T> extends ISequence<T> {
    readonly key: TKey;
}

class GroupingSequence<TKey, T> extends Sequence<T> implements IGroupingSequence<TKey, T> {

    readonly key: TKey;
    constructor(group: IGrouping<TKey, T>) {
        super(group);
        this.key = group.key;
    }
}

/**
 * Represents a sorted sequence.
 */
export interface IOrderedSequence<T> extends ISequence<T> {
    /**
     * Performs a subsequent ordering of the elements in this sequence in ascending order by using a specified comparer.
     * @param keySelector A function to extract a key from each element.
     * @param comparer An Comparer<T> to compare keys.
     * @returns An IOrderedEnumerable<TElement> whose elements are sorted according to a key.
     */
    thenBy<TKey>(keySelector: Selector<T, TKey>, comparer?: Comparer<TKey>): IOrderedSequence<T>;
    /**
     * Performs a subsequent ordering of the elements in this sequence in descending order by using a specified comparer.
     * @param keySelector A function to extract a key from each element.
     * @param comparer An Comparer<T> to compare keys.
     * @returns An IOrderedEnumerable<TElement> whose elements are sorted in descending according to a key.
     */
    thenByDescending<TKey>(keySelector: Selector<T, TKey>, comparer?: Comparer<TKey>): IOrderedSequence<T>;
}

class OrderedSequence<T> extends Sequence<T> implements IOrderedSequence<T> {
    constructor(private readonly orderedIterable: IOrderedIterable<T>) {
        super(orderedIterable);
    }

    thenBy<TKey>(keySelector: Selector<T, TKey>, comparer: Comparer<TKey> = defaultComparer): IOrderedSequence<T> {
        return new OrderedSequence<T>(this.orderedIterable.thenBy(keySelector, comparer));
    }

    thenByDescending<TKey>(keySelector: Selector<T, TKey>, comparer: Comparer<TKey> = defaultComparer): IOrderedSequence<T> {
        return new OrderedSequence<T>(this.orderedIterable.thenByDescending(keySelector, comparer));
    }
}

// ReSharper disable once InconsistentNaming
export function L<T>(iterable: Iterable<T>): ISequence<T> {
    return new Sequence(iterable);
}