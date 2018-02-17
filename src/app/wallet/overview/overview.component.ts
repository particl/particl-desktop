import { Component } from '@angular/core';
import { ColdstakeService } from './widgets/coldstake/coldstake.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [ ColdstakeService ]
})
export class OverviewComponent {

  constructor() { }

}
