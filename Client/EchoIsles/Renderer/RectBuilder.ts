import { Rect } from "./Rect";
import { IRectLike } from "./IRectLike";

export class RectBuilder {

    private rect = Rect.zero;
    private initialized = false;

    constructor(initialRect?: IRectLike) {
        if (initialRect) {
            this.append(initialRect);
        }
    }

    append(other: IRectLike) {
        if (this.initialized) {
            this.rect = this.rect.union(other);
        } else {
            this.rect = Rect.fromRectLike(other);
            this.initialized = true;
        }
    }

    toRect(): Rect {
        return this.rect;
    }
}