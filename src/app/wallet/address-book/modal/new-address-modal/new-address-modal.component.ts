import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FlashNotificationService} from '../../../../services/flash-notification.service';
import {RPCService} from '../../../../core/rpc/rpc.service';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'app-new-address-modal',
  templateUrl: './new-address-modal.component.html',
  styleUrls: ['./new-address-modal.component.scss']
})
export class NewAddressModalComponent implements OnInit {
  @Output() onAddressAdd = new EventEmitter();

  public addLableForm: FormGroup;
  public type: string;
  public label: string;

  constructor(public dialogRef: MdDialogRef<NewAddressModalComponent>,
              private formBuilder: FormBuilder,
              private rpc: RPCService,
              private flashNotificationService: FlashNotificationService) {
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
