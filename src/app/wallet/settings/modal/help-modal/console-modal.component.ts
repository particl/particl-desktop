import {Component, OnInit, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger';

import { RpcService } from '../../../../core/core.module';
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
    this.commandList.push(new Command(1, this.command, this.dateFormatter(new Date())),
      new Command(2, respText, this.dateFormatter(new Date()), 200));
    this.command = '';
  }

  formatErrorResponse(error: any) {
    if (error.code === -1) {
      this.commandList.push(new Command(1, this.command, this.dateFormatter(new Date())),
        new Command(2, error.message, this.dateFormatter(new Date()), -1));
      this.command = '';
    }
  }

  clearCommands() {
    this.commandList = [];
  }

    /* Time stuff */
  getCurrentTime() {
    this.currentTime = this.dateFormatter(new Date());
  }

  private dateFormatter(d: Date) {
    return (
      (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + ':' +
      (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ':' +
      (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds())
    )
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
