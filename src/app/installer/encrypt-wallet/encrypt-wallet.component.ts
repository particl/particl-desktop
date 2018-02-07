import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Log } from 'ng2-logger';

import { EncryptWalletService } from 'app/installer/encrypt-wallet/encrypt-wallet.service';



@Component({
  selector: 'app-encrypt-wallet',
  templateUrl: './encrypt-wallet.component.html',
  styleUrls: ['./encrypt-wallet.component.scss'],
  providers: [EncryptWalletService]
})
export class EncryptWalletComponent implements OnInit {

  log: any = Log.create('encrypt-wallet.component');

  /* Password stuff */
  password: string;
  passwordVerify: string;
  // hide the password or not (*** vs abc)
  hide: boolean = true;
  get passwordsAreMatching(): boolean { return this.password !== undefined && (this.password === this.passwordVerify); }

  daemonIsAlreadyRestarting: boolean = false;

  error: string;

  constructor(
    private encryptService: EncryptWalletService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  encrypt(): void {
    // safety check, button shouldn't be cliclable anyways
    if (!this.passwordsAreMatching) {
      this.error = 'Passwords do not match.';
      return;
    }
    // encrypt wallet
    this.encryptService.encrypt(this.password).subscribe(
      (success) => {
        this.log.d('encrypt, encrypted fine');
        this.daemonIsAlreadyRestarting = true;

        // wallet encrypted fine, restart daemon and go to loading
        this.encryptService.restartDaemon().subscribe(
          () => {
            this.log.d('encrypt, restarted fine');
            // we have to wait a bit, daemon doesn't stop immediately.
            // so rpc calls are still working, can't switch immediately
            this.router.navigate(['loading']);
          },
          error => this.error = error);


      },
      (error) => { this.error = error }
    );

  }

  skip(): void {
    this.router.navigate(['installer/create']);
  }

}
