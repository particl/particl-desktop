import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { ModalsHelperService } from 'app/modals/modals.module';
import { RpcService, SnackbarService } from '../../../../core/core.module';
@Component({
  selector: 'detail-address',
  templateUrl: './detail-address.component.html',
  styleUrls: ['./detail-address.component.scss']
})
export class DetailAddressComponent implements OnInit, OnChanges {

  @Input() selected: any;
  @Input() type: string = 'public';
  @Output() rpcLabelUpdate: EventEmitter<any> = new EventEmitter();

  isEditableMode: boolean = true;
  label: string;
  log: any = Log.create('detail-address.component');

  constructor( private modals: ModalsHelperService,
    private rpc: RpcService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    // Setting label forcefully
    if (this.selected) {
      this.label = this.selected.label;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isEditableMode = true;
  }


  changeLabel(): void {
    this.isEditableMode = !this.isEditableMode;
    if (this.selected.label === '(No label)') {
      this.selected.label = '';
    }
  }

  updateLabel(address: string) {
    this.modals.unlock({timeout: 3}, (status) => this.editLabel(address));
  }

  editLabel(address: string): void {
    const call = 'manageaddressbook';
    const callParams = ['newsend', address, this.label];
    const msg = `Label for ${address} updated`;
    this.rpcCallAndNotify(call, callParams, msg);
  }

  copyToClipBoard(): void {
    this.snackbar.open('Address copied to clipboard', '');
  }

  rpcCallAndNotify(call: string, callParams: any, msg: string): void {
    if (call) {
      this.rpc.call(call, callParams)
        .subscribe(response => {
          this.log.d(call, `addNewLabel: successfully executed ${call} ${callParams}`);
          this.isEditableMode = true;
          this.rpcLabelUpdate.emit(msg)
        });
    }
  }
}
