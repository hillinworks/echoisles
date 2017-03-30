export enum VerticalDirection {
    Above,
    Under
}

export module VerticalDirection {

    export function select<T>(direction: VerticalDirection, above: (above: void) => T, under: (under: void) => T): T {
        switch (direction) {
            case VerticalDirection.Above:
                return above(undefined);
            case VerticalDirection.Under:
                return under(undefined);
            default:
                throw new Error();
        }
    }

}