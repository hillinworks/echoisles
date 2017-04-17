export function assert(condition: boolean, message?: string): condition is true {
    if (condition)
        return true;

    throw new Error(message);
}