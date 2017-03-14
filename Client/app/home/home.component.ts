import { Component } from '@angular/core';
import { routerTransition, hostStyle } from '../router.animations';
import { Accidental } from "../../EchoIsles/Core/MusicTheory/Accidental";
import { Parser } from "../../EchoIsles/Parsing/Parser";
import { Http } from "@angular/http";


@Component({
  selector: 'appc-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  animations: [routerTransition()],
  // tslint:disable-next-line:use-host-property-decorator
  host: hostStyle()
})
export class HomeComponent {
    public testString: string;

    constructor(http: Http) {
        this.testString = Accidental[Accidental.parse("##") !];

        http.get("./samples/city of stars.txt")
            .subscribe(req => {
                const source = req.text();
                this.testString  = JSON.stringify(Parser.parse(source).value);
            });
    }

} 
