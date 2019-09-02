import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger';

import { DateFormatter } from '../../../../../core/util/utils';
import { RpcService, RpcStateService } from '../../../../../core/core.module';
import { MarketService } from '../../../../../core/market/market.module';
import { SnackbarService } from '../../../../../core/snackbar/snackbar.service';
import { Command } from './command.model';
import * as marketConfig from '../../../../../../../modules/market/config.js';
import { isFinite, isString } from 'lodash';

@Component({
  selector: 'app-console-modal',
  templateUrl: './console-modal.component.html',
  styleUrls: ['./console-modal.component.scss']
})
export class ConsoleModalComponent implements OnInit, AfterViewChecked {

  @ViewChild('debug') private commandContainer: ElementRef;
  log: any = Log.create('app-console-modal');

  public commandList: Command[] = [];
  public commandHistory: Array<string> = [];
  public command: string;
  public currentTime: string;
  public disableScrollDown: boolean = false;
  public waitingForRPC: boolean = true;
  public historyCount: number = 0;
  public activeTab: string = '_rpc';
  public marketTabEnabled: boolean = false;
  public useRunstringsParser: boolean = false;

  constructor(private _rpc: RpcService,
              private _rpcState: RpcStateService,
              private market: MarketService,
              private dialog: MatDialogRef<ConsoleModalComponent>,
              private snackbar: SnackbarService) {
    this.marketTabEnabled = (marketConfig.allowedWallets || []).find(
      (wname: string) => wname.toLowerCase() === this._rpc.wallet.toLowerCase()
    ) !== undefined;
  }

  ngOnInit() {
    this.getCurrentTime();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  rpcCall() {
    this.waitingForRPC = false;
    this.commandHistory.push(this.command);
    this.historyCount = this.commandHistory.length;
    let commandString: string;
    let callableParams: (string|number|boolean|null)[];

    if (this.useRunstringsParser) {
      let params = this.queryParserRunstrings(this.command);
      commandString = 'runstrings';
      if (params.length > 0) {
        params.splice(1, 0, '');
      }

      callableParams = params;

      if (this.activeTab === 'market') {
        commandString = params.shift();
        params = params.length > 1 ? params.filter(cmd => cmd.trim() !== '') : [];
        callableParams = params.map((param) => isFinite(+param) ? +param : param);
      }
    } else {
      const params = this.queryParserCommand(this.command);
      commandString = String(params.shift());
      callableParams = params;
    }

    this[this.activeTab].call(commandString, callableParams)
      .subscribe(
        (response: any) => this.formatSuccessResponse(response),
        (error: any) => {
          this.formatErrorResponse(error)
        }
      );
  }

  formatSuccessResponse(response: any) {
    this.waitingForRPC = true;
    this.commandList.push(new Command(1, this.command, this.getDateFormat()),
      new Command(2, response, this.getDateFormat(), 200));
    this.command = '';
    this.scrollToBottom();
  }

  formatErrorResponse(error: any) {
    this.waitingForRPC = true;
    if (error.code === -1) {
      this.commandList.push(new Command(1, this.command, this.getDateFormat()),
        new Command(2, error.message, this.getDateFormat(), -1));
      this.command = '';
      this.scrollToBottom();
    } else {
      let errorMessage: string;
      if (this.activeTab === 'market') {
        const errorStr = String(error).toLowerCase();
        errorMessage = errorStr.includes('unknown command') || errorStr.includes('unknown subcommand') ? 'Invalid command' : error;
      } else {
        errorMessage = (error.message) ? error.message : 'Method not found'
      }
      this.snackbar.open(errorMessage);
    }
  }

  private queryParserRunstrings(com: string): Array<string> {
    return com.trim().replace(/\s+(?=[^[\]]*\])|\s+(?=[^{\]]*\})|(("[^"]*")|\s)/g, '$1').split(' ')
          .filter(cmd => cmd.trim() !== '')
  }

  private queryParserCommand(com: string): Array<string | number | boolean | null> {
    let newToken = -1;
    let lastToken = newToken;
    let currentDelim = '';
    let escaped = false;
    const tokens: string[] = [];
    for (let ii = 0; ii < com.length; ++ii) {
      const currentChar = com[ii];
      if (currentChar === '\\') {
        escaped = !escaped;
        continue;
      }
      if (![`"`, `'`].includes(currentChar)) {
        escaped = false;

        if (currentChar === ' ' && newToken === -1) {
          const tempCurrent = com.substring(lastToken + 1, ii).trim();
          if (tempCurrent.length) {
            tokens.push(tempCurrent);
          }
          lastToken = ii;
        }
        continue;
      }

      if (currentDelim === '') {
        if (!escaped) {
          currentDelim = currentChar;
        } else {
          continue;
        }
      } else if ( (currentDelim !== currentChar) || escaped) {
        continue;
      }

      if (newToken === -1) {
        if (!tokens.length) {
          tokens.push(com.substring(newToken + 1, ii).trim());
        }
        newToken = ii;
        lastToken = ii;
      } else {
        tokens.push(com.substring(newToken + 1, ii).trim());
        newToken = -1;
        lastToken = ii;
      }
    }

    const finalToken = com.substring(lastToken + 1, com.length).trim();
    if (finalToken.length) {
      tokens.push(finalToken);
    }

    if (tokens[0]) {
      const cmdParts = (<string>tokens[0]).split(' ');
      if (cmdParts.length > 1) {
        const cmd = cmdParts.splice(0, 1);
        tokens.splice(0, 1, cmd[0], cmdParts.join(' '));
      }
    }

    const correctedTokens: (string|number|boolean|null)[] = [];

    for (let ii = 0; ii < tokens.length; ++ii) {
      const token = tokens[ii];
      let value: any;
      if (token.length && isFinite(+token)) {
        value = +token;
      } else if (['false', 'true'].includes( String(token).toLowerCase() )) {
        value = String(token).toLowerCase() === 'true';
      } else if (['undefined', 'null'].includes(String(token).toLowerCase())) {
        value = null;
      } else {
        value = token;
      }
      correctedTokens.push(value);
    }

    return correctedTokens;
  }

  isJson(text: any) {
    return (typeof text === 'object');
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

  scrollToBottom() {
    if (this.disableScrollDown) {
      return
    }
    this.commandContainer.nativeElement.scrollTop = this.commandContainer.nativeElement.scrollHeight;
  }

  onScroll() {
    const element = this.commandContainer.nativeElement
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight
    if (this.disableScrollDown && atBottom) {
      this.disableScrollDown = false
    } else {
      this.disableScrollDown = true
    }
  }

  manageCommandHistory(code: number) {
    if (code === 38) {
      if (this.historyCount > 0) {
        this.historyCount--;
      }
    } else {
      if (this.historyCount <= this.commandHistory.length) {
        this.historyCount++;
      }
    }
    this.command = this.commandHistory[this.historyCount];
  }

  selectTab(tabIndex: number) {
    if (tabIndex === 1 && !this.marketTabEnabled) {
      return;
    }
    const currentTab = this.activeTab;
    this.activeTab = tabIndex === 1 ? 'market' : '_rpc';
    if (this.activeTab === currentTab) {
      return;
    }
    this.commandList = [];
  }

  // capture the enter button
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if ([13, 38, 40].includes(event.keyCode)) {
      event.preventDefault();
    }
    if (event.keyCode === 13 && this.command && this.waitingForRPC) {
      this.disableScrollDown = false;
      this.rpcCall();
    } else if (event.ctrlKey && event.keyCode === 76) {
      this.clearCommands();
      // Up and Down arrow KeyPress to manage command history
    } else if ([38, 40].includes(event.keyCode) && this.commandHistory.length > 0) {
      this.manageCommandHistory(event.keyCode);
    }
  }

  close(): void {
    this.dialog.close();
  }

}
