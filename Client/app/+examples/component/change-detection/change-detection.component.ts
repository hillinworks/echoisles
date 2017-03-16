import { Component } from '@angular/core';

@Component({
    selector: 'appc-comment-demo',
    templateUrl: './change-detection.component.html'
})
export class ChangeDetectionComponent {

    public counter = 0;

    public count() {
        this.counter++;
    }
}
