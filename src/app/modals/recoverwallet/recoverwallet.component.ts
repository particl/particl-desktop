import { Component } from '@angular/core';

import { AppService } from '../../app.service';

@Component({
  selector: 'app-recoverwallet',
  templateUrl: './recoverwallet.component.html',
  styleUrls: ['./recoverwallet.component.scss']
})
export class RecoverwalletComponent {

  words: string[] = Array(24).fill('');

  constructor (private appService: AppService) { }

  restore(password: string) {
    // TODO API call
    let wordsString: string = '';
    for(var i in this.words) {
      const word = this.words[i];
      if(word !== undefined && word !== '') {
      	wordsString += ( (wordsString === '' ? '' : ' ') + word);
      }
    }
    const params : Array<any> = this.getParams(wordsString, password);
    this.appService.rpc.call(this, 'extkeygenesisimport', params, this.rpc_importFinished);
    this.words = Array(24).fill('');
  }

  getParams(words, password): Array<any> {
  	if(password === undefined) {
  	  return [words];
  	} else {
  	  return [words, password];
  	}
  }

  rpc_importFinished(JSON: Object) {
  	// TODO for rpc service: needs ERROR handling!
  	if(JSON['result'] === 'Success.') {
  		alert('Importing the recovery phrase succeeded!');
  	}
  }
}
