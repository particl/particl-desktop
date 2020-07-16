import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { EditShippingProfileModalComponent } from './edit-shipping-profile-modal/edit-shipping-profile-modal.component';

@Component({
  selector: 'market-buy-shipping-profiles',
  templateUrl: './buy-shipping-profiles.component.html',
  styleUrls: ['./buy-shipping-profiles.component.scss']
})
export class BuyShippingProfilesComponent implements OnInit {

  searchQuery: FormControl = new FormControl('');

  public filters: any = {
    search: undefined
  };

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openEditShippingProfileModal(): void {
    const dialog = this._dialog.open(EditShippingProfileModalComponent);
  }

}
