import { Component, OnInit } from '@angular/core';
import { routerTransition, hostStyle } from '../router.animations';
import { Parser } from "../../EchoIsles/Parsing/Parser";
import { Http } from "@angular/http";
import { ParseHelper } from "../../EchoIsles/Parsing/ParseResult";
import "rxjs/add/operator/toPromise";
// ReSharper disable once UnusedLocalImport
import { fabric } from 'fabric';

@Component({
    selector: 'appc-home',
    styles: [require('./home.component.scss')],
    template: require('./home.component.html'),
    animations: [routerTransition()],
    // tslint:disable-next-line:use-host-property-decorator
    host: hostStyle()
})
export class HomeComponent implements OnInit {
    private fabricCanvas: fabric.Canvas;

    constructor(private readonly http: Http) {

    }

    private async loadTablature(): Promise<void> {

        const response = await this.http.get("./samples/city of stars.txt").toPromise();
        const source = response.text();
        const result = Parser.parse(source);

        if (ParseHelper.isSuccessful(result)) {
            const document = result.value;
            alert(JSON.stringify(document));

        }
    }

    ngOnInit(): void {

        this.createCanvas();
        this.loadTablature();
    }

    private createCanvas() {
        const canvas = document.getElementById("test_canvas") as HTMLCanvasElement;
        this.fabricCanvas = new fabric.Canvas(canvas);
    }

} 
