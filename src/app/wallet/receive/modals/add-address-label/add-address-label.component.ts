import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RPCService } from '../../../../core/rpc/rpc.service';
import { MdDialogRef } from '@angular/material';
import { FlashNotificationService } from '../../../../services/flash-notification.service';

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

  constructor(
    public dialogRef: MdDialogRef<AddAddressLabelComponent>,
    private formBuilder: FormBuilder,
    private rpc: RPCService,
    private flashNotificationService: FlashNotificationService
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
    const call = this.type === 'public' ? 'getnewaddress' : (this.type === 'private' ? 'getnewstealthaddress' : '');

    if (!!call) {
      this.rpc.call(call, [this.label])
        .subscribe(response => {
            this.onAddressAdd.emit(response);
            this.dialogRef.close();
            this.flashNotificationService.open(`New ${this.type} address lable added !!`)
          });
    }
  }

}
