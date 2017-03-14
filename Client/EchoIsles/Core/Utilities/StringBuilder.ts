export class StringBuilder {

    private readonly data = new Array<string>();

    get length(): number {
        return this.data.reduce((length, d) => length += d.length, 0);
    }

    get hasContent(): boolean {
        return this.data.length > 0;
    }

    append(text: any): StringBuilder {
        this.data.push(text.toString());
        return this;
    }

    appendLine(text?: any): StringBuilder {
        if (text !== undefined)
            this.data.push(text.toString());

        this.data.push("\n");
        return this;
    }

    toString(): string {
        return this.data.join("");
    }
}