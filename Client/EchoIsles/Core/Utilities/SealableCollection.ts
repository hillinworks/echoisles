import { IClonable, Clonable } from "../IClonable";

export class SealableCollection<T> {

    private readonly storage = new Array<T>();
    private _isSealed: boolean;

    get isSealed(): boolean {
        return this._isSealed;
    }

    get length(): number {
        return this.storage.length;
    }

    private get isMemberClonable(): boolean | undefined {
        if (this.storage.length === 0)
            return undefined;

        return (this.storage[0] as any as IClonable<T>).clone !== undefined;
    }

    [Symbol.iterator](): Iterator<T> {
        return this.storage[Symbol.iterator]();
    }

    private checkSealed(): void {
        if (this.isSealed)
            throw new Error("this collection is sealed an uneditable");
    }

    add(item: T): void {
        this.checkSealed();
        this.storage.push(item);
    }

    clear(): void {
        this.checkSealed();
        this.storage.length = 0;
    }

    contains(item: T): boolean {
        return this.storage.indexOf(item) >= 0;
    }

    seal(): void {
        this._isSealed = true;
    }

    clone(forceShallow = false): SealableCollection<T> {
        const clone = new SealableCollection<T>();

        if (this.storage.length === 0)
            return clone;

        if (!forceShallow && this.isMemberClonable) {
            this.storage.forEach(s => clone.storage.push(Clonable.clone(s)));
        } else {
            this.storage.forEach(s => clone.storage.push(s));
        }

        return clone;
    }

    appendClone(other: SealableCollection<T>): void {
        if (this.isMemberClonable) {
            other.storage.forEach(s => this.storage.push(Clonable.clone(s)));
        } else {
            this.storage.forEach(s => this.storage.push(s));
        }

    }

}