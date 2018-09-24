import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger';

import { RpcService, RpcStateService } from '../../../../../core/core.module';

import { SnackbarService } from '../../../../../core/snackbar/snackbar.service';
import { ModalsHelperService } from 'app/modals/modals.module';

@Component({
  selector: 'app-add-address-label',
  templateUrl: './add-address-label.component.html',
  styleUrls: ['./add-address-label.component.scss']
})
export class AddAddressLabelComponent implements OnInit {

  @Output() onAddressAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public addLableForm: FormGroup;
  public type: string;
  public label: string;
  public address: string;
  log: any = Log.create('receive.component');

  constructor(
    public dialogRef: MatDialogRef<AddAddressLabelComponent>,
    private formBuilder: FormBuilder,
    private rpc: RpcService,
    private rpcState: RpcStateService,
    private flashNotificationService: SnackbarService,
    private dialog: MatDialog,

    // @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
    private modals: ModalsHelperService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.addLableForm = this.formBuilder.group({
      label: this.formBuilder.control(null, [Validators.required]),
    });
  }

  onSubmitForm(): void {
    this.modals.unlock({timeout: 3}, (status) => this.addNewLabel());
  }

  addNewLabel(): void {
    let call = (this.type === 'public' ? 'getnewaddress' : (this.type === 'private' ? 'getnewstealthaddress' : ''));
    let callParams = [this.label];
    let msg = `New ${this.type} address generated, with label ${this.label}!`;
    if (this.address !== '') {
      call = 'manageaddressbook';
      callParams = ['newsend', this.address, this.label];
      msg = `Updated label of ${this.address} to ${this.label}`;
    }

    if (!!call) {
      this.rpc.call(call, callParams)
        .subscribe(response => {
          this.log.d(call, `addNewLabel: successfully executed ${call} ${callParams}`);
          this.onAddressAdd.emit(response);
          this.dialogRef.close();
          this.flashNotificationService.open(msg)
        });
    }
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

}
