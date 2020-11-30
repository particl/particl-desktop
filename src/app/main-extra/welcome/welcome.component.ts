import { Component } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  public readonly clientVersion: string = environment.version;

  constructor() { }

}
