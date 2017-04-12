import { Component, OnInit } from '@angular/core';
import { routerTransition, hostStyle } from '../router.animations';
import { Parser } from "../../EchoIsles/Parsing/Parser";
import { Http } from "@angular/http";
import { ParseHelper } from "../../EchoIsles/Parsing/ParseResult";
import "rxjs/add/operator/toPromise";
// ReSharper disable once WrongRequireRelativePath
import { fabric } from "fabric";
import { render } from "../../EchoIsles/Renderer/Renderer";

@Component({
    selector: 'appc-home',
    styles: [require('./home.component.scss')],
    template: require('./home.component.html'),
    animations: [routerTransition()],
    // tslint:disable-next-line:use-host-property-decorator
    host: hostStyle()
})
export class HomeComponent implements OnInit {
    private fabricCanvas: fabric.StaticCanvas;

    constructor(private readonly http: Http) {

    }

    private async loadTablature(): Promise<void> {

        const response = await this.http.get("./samples/temptest.txt").toPromise();
        const source = response.text();
        const result = Parser.parse(source);

        if (ParseHelper.isSuccessful(result)) {
            const document = result.value;
            render(document, this.fabricCanvas);
        } else {
            alert(result.messages.map(m => m.toString()).join("\n"));
        }
    }

    ngOnInit(): void {

        this.createCanvas();
        this.loadTablature();
    }

    private createCanvas() {
        const canvas = document.getElementById("test_canvas") as HTMLCanvasElement;
        this.fabricCanvas = new fabric.StaticCanvas(canvas);
    }

} 
