import { Component } from '@angular/core';
import { ModalsModule } from '../modals.module';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  unlock(password: string) {
    // TODO API call
    console.log(password);
  }
}
