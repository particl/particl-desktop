import { Component, OnInit } from '@angular/core';
import { ModalsComponent } from '../../modals/modals.component';
import { MdDialog } from '@angular/material';
import { ModalsService } from '../../modals/modals.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class LayoutSideNavComponent implements OnInit {

  constructor(private dialog: MdDialog,
              private _modalsService: ModalsService) {
  }

  ngOnInit() {
  }

  createWallet() {
   //  this.dialog.open(ModalsComponent, {disableClose: true, width: '100%', height: '100%'});
   // this._modalsService.open('createWallet', {forceOpen: true});
  }

}
