import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnDestroy
} from '@angular/core';
import { Log } from 'ng2-logger';
import { isFinite, isPlainObject, isArray } from 'lodash';
import { Subject, fromEvent } from 'rxjs';
import { finalize, takeUntil, filter, map } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { DateFormatter } from 'app/core/util/utils';
import { Command } from './command.model';


enum TextContent {
  FORMAT_ERROR = 'There appears to be a formatting error',
  INVALID_COMMAND = 'Method not found'
}


@Component({
  templateUrl: './console-modal.component.html',
  styleUrls: ['./console-modal.component.scss']
})
export class ConsoleModalComponent implements OnInit, AfterViewChecked, OnDestroy {

  log: any = Log.create('app-console-modal');

  public commandList: Command[] = [];
  public command: string;
  public currentTime: string;
  public disableScrollDown: boolean = false;
  public waitingForRPC: boolean = true;
  public useRunstringsParser: boolean = false;

  @ViewChild('debug', {static: false}) private commandContainer: ElementRef;
  @ViewChild('commandInput', {static: true}) private commandInput: ElementRef;

  private destroy$: Subject<void> = new Subject();
  private commandHistory: Array<string> = [];
  private historyCount: number = 0;

  constructor(
    private _rpc: MainRpcService,
    private snackbar: SnackbarService
  ) { }

  ngOnInit() {
    this.currentTime = this.getDateFormat();

    fromEvent(this.commandInput.nativeElement, 'keydown').pipe(
      filter((event: any) => [13, 38, 40].includes(event.keyCode) || (event.ctrlKey && event.keyCode === 76)),
      map((event: any) => {
        event.preventDefault();
        return event.keyCode;
      }),
      takeUntil(this.destroy$)
    ).subscribe(
      (keyCode: number) => {
        switch (keyCode) {
          case 13:
            if (this.command && this.waitingForRPC) {
              this.disableScrollDown = false;
              this.rpcCall();
            }
            break;

          case 76:
            // ctrl+L to clear the output
            this.commandList = [];
            break;

          case 38:
            if ((this.commandHistory.length > 0) && (this.historyCount > 0)) {
              this.historyCount--;
              this.command = this.commandHistory[this.historyCount];
            }
            break;

          case 40:
            if ((this.commandHistory.length > 0) && (this.historyCount <= this.commandHistory.length)) {
              this.historyCount++;
              this.command = this.commandHistory[this.historyCount];
            }
            break;
        }
      }
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  isJson(text: any) {
    return (typeof text === 'object');
  }


  scrollToBottom() {
    if (this.disableScrollDown) {
      return;
    }
    this.commandContainer.nativeElement.scrollTop = this.commandContainer.nativeElement.scrollHeight;
  }


  onScroll() {
    const element = this.commandContainer.nativeElement;
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    if (this.disableScrollDown && atBottom) {
      this.disableScrollDown = false;
    } else {
      this.disableScrollDown = true;
    }
  }


  rpcCall() {
    this.waitingForRPC = false;
    this.commandHistory.push(this.command);
    this.historyCount = this.commandHistory.length;
    let commandString: string;
    let callableParams: (string|number|boolean|null)[];

    if (this.useRunstringsParser) {
      const params = this.queryParserRunstrings(this.command);
      commandString = 'runstrings';
      if (params.length > 0) {
        params.splice(1, 0, '');
      }

      callableParams = params;

    } else {
      const params = this.queryParserCommand(this.command);
      if (!params.length) {
        this.formatErrorResponse({message: TextContent.FORMAT_ERROR});
        return;
      }
      commandString = String(params.shift());
      callableParams = params;
    }

    this._rpc.call(commandString, callableParams).pipe(
      finalize(() => {
        this.waitingForRPC = true;
        this.scrollToBottom();
      })
    ).subscribe(
        (response: any) => this.formatSuccessResponse(response),
        (error: any) => this.formatErrorResponse(error)
      );
  }


  private formatSuccessResponse(response: any) {
    this.commandList.push(new Command(1, this.command, this.getDateFormat()),
      new Command(2, response, this.getDateFormat(), 200));
    this.command = '';
    this.scrollToBottom();
  }

  private formatErrorResponse(error: any) {
    if (error.code === -1) {
      this.commandList.push(new Command(1, this.command, this.getDateFormat()),
        new Command(2, error.message, this.getDateFormat(), -1));
      this.command = '';
    } else {
      const errorMessage = (error.message) ? error.message : TextContent.INVALID_COMMAND;
      this.snackbar.open(errorMessage, 'warn');
    }
  }

  private queryParserRunstrings(com: string): Array<string> {
    return com.trim().replace(/\s+(?=[^[\]]*\])|\s+(?=[^{\]]*\})|(("[^"]*")|\s)/g, '$1').split(' ')
          .filter(cmd => cmd.trim() !== '');
  }


  private getDateFormat() {
    return new DateFormatter(new Date()).hourSecFormatter();
  }


  private queryParserCommand(com: string): Array<any> {
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
        }
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
          const z = JSON.parse(token.replace(/\\"/g, '"'));
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
}
