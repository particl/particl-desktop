import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RPCService } from '../../../../core/rpc/rpc.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import { FlashNotificationService } from '../../../../services/flash-notification.service';
import { Log } from 'ng2-logger';
import {ModalsComponent} from "../../../../modals/modals.component";
import {ModalsService} from "../../../../modals/modals.service";

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
  log: any = Log.create('receive.component');

  constructor(
    public dialogRef: MdDialogRef<AddAddressLabelComponent>,
    private formBuilder: FormBuilder,
    private rpc: RPCService,
    private flashNotificationService: FlashNotificationService,
    private dialog: MdDialog,
    private _modals: ModalsService
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.addLableForm = this.formBuilder.group({
      label: this.formBuilder.control(null, [Validators.required]),
    });
  }

  onSubmitForm(): void {
    if (['Locked', 'Unlocked, staking only'].indexOf(this.rpc.state.get('encryptionstatus')) !== -1) {
      // unlock wallet and send transaction
      this.dialog.open(ModalsComponent, {disableClose: true, width: '100%', height: '100%'});
      this._modals.open('unlock', {forceOpen: true, timeout: 3, callback: this.addNewLabel.bind(this)});
    } else {
      // wallet already unlocked
      this.addNewLabel();
    }
  }

  addNewLabel(): void{
    const call = (this.type === 'public' ? 'getnewaddress' : (this.type === 'private' ? 'getnewstealthaddress' : ''));
    this.log.d(call, 'newAddress: successfully retrieved new address');
    if (!!call) {
      this.rpc.call(call, [this.label])
        .subscribe(response => {
          this.log.d(call, 'newAddress: successfully retrieved new address');
          this.onAddressAdd.emit(response);
          this.dialogRef.close();
          this.flashNotificationService.open(`New ${this.type} address lable added !!`)
        });
    }
  }

}
