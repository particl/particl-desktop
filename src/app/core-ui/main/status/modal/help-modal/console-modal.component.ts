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
import { isFinite, isPlainObject, isArray } from 'lodash';
import { SettingsStateService } from 'app/settings/settings-state.service';
import { takeWhile } from 'rxjs/operators';

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
              private snackbar: SnackbarService,
              private _settingsService: SettingsStateService) {
  }

  ngOnInit() {
    let continueListening = true;
    this._settingsService.currentWallet().pipe(takeWhile(() => continueListening)).subscribe(
      (wallet) => {
        // Primary purpose of the null check is to cater for live reload...
        //  this should not typically be needed otherwise
        if (wallet === null) {
          return;
        }
        this.marketTabEnabled = wallet.isMarketEnabled === true;
        continueListening = false;
      }
    );
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
      if (!params.length) {
        this.formatErrorResponse({message: 'There appears to be a formatting error'});
        return;
      }
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

  queryParserRunstrings(com: string): Array<string> {
    return com.trim().replace(/\s+(?=[^[\]]*\])|\s+(?=[^{\]]*\})|(("[^"]*")|\s)/g, '$1').split(' ')
          .filter(cmd => cmd.trim() !== '')
  }

  queryParserCommand(com: string): Array<any> {
    let parseError = false;
    let lastTokenPos = -1;
    const delimStack: string[] = [];
    let escaped = false;
    const tokens: string[] = [];
    let braceStart = '';
    let braceEnd = '';
    for (let ii = 0; ii < com.length; ++ii) {
      const currentChar = com[ii];

      // Mark next character as being escaped if necessary
      if (currentChar === '\\') {
        escaped = !escaped;
        continue;
      }

      // If character is not a 'token delimiting' character...
      if (![`"`, `'`, `{`, `}`, '[', ']'].includes(currentChar)) {
        escaped = false;

        // ... if we hit a space character while not already involved in a token extraction,
        //      then the previous string was likely a token by itself (only if its length was greater than 0)
        if (currentChar === ' ' && delimStack.length === 0) {
          const tempCurrent = com.substring(lastTokenPos + 1, ii).trim();
          if (tempCurrent.length) {
            tokens.push(tempCurrent);
          }
          lastTokenPos = ii;
        }
        continue;
      }

      // PROCESS A DELIMITER CHARACTER

      // Except if it has been escaped
      if (escaped) {
        escaped = false;
        continue;
      }

      // No tokens being extracted currently
      if (delimStack.length === 0) {
        if ([`}`, ']'].includes(currentChar)) {
          parseError = true;
          break;
        }
        delimStack.push(currentChar);

        // if not already busy with a token extraction,
        //    then any previous string was likely a token on its own
        if ( (lastTokenPos + 1) < ii ) {
          const tempCurrent = com.substring(lastTokenPos + 1, ii).trim();
          if (tempCurrent.length) {
            tokens.push(tempCurrent);
          }
        }

        // set the token start markers
        lastTokenPos = ii;
        continue;
      }

      const isQuoteMark = [`"`, `'`].includes(currentChar);

      // Process possible quotation marks being included in an existing string
      const quoteIdx = delimStack.findIndex((delim) => delim === `'` || delim === `"`);
      if (isQuoteMark) {
        if (quoteIdx !== -1 && delimStack[quoteIdx] !== currentChar) {
          continue;
        };
      }

      // Process possible validation issues
      const lastDelim = delimStack[delimStack.length - 1];
      if ( (  ( (currentChar === '}' && lastDelim !== '{') ||
                (currentChar === ']' && lastDelim !== '[')
              ) &&
              ![`'`, `"`].includes(lastDelim)
           ) ||
            (isQuoteMark && (quoteIdx !== -1) && (currentChar !== lastDelim) )
      ) {
        parseError = true;
        break;
      }

      // Now add or remove a delimiter and process possible token accordingly
      if (!isQuoteMark && [`'`, `"`].includes(lastDelim) && (delimStack.length > 0)) {
        // do nothing
      } else if ([`}`, `]`].includes(currentChar) || (lastDelim === currentChar) ) {
        if (delimStack.length === 1) {
          if (isQuoteMark) {
            braceStart = '';
            braceEnd = '';
          } else {
            braceStart = delimStack[0];
            braceEnd = currentChar;
          }
        }
        delimStack.pop();
      } else {
        delimStack.push(currentChar);
      }

      if (delimStack.length === 0) {
        tokens.push(`${braceStart}${com.substring(lastTokenPos + 1, ii).trim()}${braceEnd}`);
        lastTokenPos = ii;
      }
    }

    if (delimStack.length) {
      parseError = true;
    }

    if (parseError) {
      return [];
    }

    const finalToken = com.substring(lastTokenPos + 1, com.length).trim();
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

    const correctedTokens: any[] = [];

    for (let ii = 0; ii < tokens.length; ++ii) {
      const token = tokens[ii];
      let value: any;
      if (token.length && isFinite(+token)) {
        value = +token;
      } else if (['false', 'true'].includes( String(token).toLowerCase() )) {
        value = String(token).toLowerCase() === 'true';
      } else if (['undefined', 'null'].includes(String(token).toLowerCase())) {
        value = null;
      } else if ( (token.includes('{') && token.includes('}')) || (token.includes('[') && token.includes(']')) ) {
        try {
          const z = JSON.parse(token);
          if (isPlainObject(z) || isArray(z)) {
            value = z;
          }
        } catch (err) {
          // nothing to do... will be set to the stringified value
        }
      }
      if (value === undefined) {
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
