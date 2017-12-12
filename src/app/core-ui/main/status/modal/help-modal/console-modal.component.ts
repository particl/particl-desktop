import {Component, OnInit, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger';

import { DateFormatter } from '../../../../../wallet/shared/util/utils';

import { RpcService } from '../../../../../core/core.module';
import { Command } from './command.model';

@Component({
  selector: 'app-console-modal',
  templateUrl: './console-modal.component.html',
  styleUrls: ['./console-modal.component.scss']
})
export class ConsoleModalComponent implements OnInit {

  log: any = Log.create('app-console-modal');
  public commandList: Array<any> = [];
  public command: string;
  public currentTime: string;


  constructor(public dialogRef: MatDialogRef<ConsoleModalComponent>,
              private _rpc: RpcService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getCurrentTime();
  }

  rpcCall() {
    const params = this.command.split(' ');
    this._rpc.call(params.shift(), params)
      .subscribe(
        response => this.formatSuccessResponse(response),
        error => this.formatErrorResponse(error));
  }

  formatSuccessResponse(response: any) {
    let respText = '';
    if (typeof response === 'object') {
      respText = JSON.stringify(response, null, 1);
    } else {
      respText = response;
    }
    this.commandList.push(new Command(1, this.command, this.getDateFormat()),
      new Command(2, respText, this.getDateFormat(), 200));
    this.command = '';
  }

  formatErrorResponse(error: any) {
    if (error.code === -1) {
      this.commandList.push(new Command(1, this.command, this.getDateFormat()),
        new Command(2, error.message, this.getDateFormat(), -1));
      this.command = '';
    }
  }

  clearCommands() {
    this.commandList = [];
  }

    /* Time stuff */
  getCurrentTime() {
    this.currentTime = this.getDateFormat();
  }

  getDateFormat() {
    return new DateFormatter(new Date()).hourSecFormatter();
  }

  // capture the enter button
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.keyCode === 13) {
      this.rpcCall();
    }
    if (event.ctrlKey && event.keyCode === 76) {
      this.clearCommands();
    }
  }

}
