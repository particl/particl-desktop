import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RpcWithStateModule } from 'app/core/rpc/rpc.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { SettingsStateService } from 'app/settings/settings-state.service';
import { IpcService } from 'app/core/ipc/ipc.service';

import { DeleteWalletModalComponent } from './delete-wallet-modal.component';

describe('DeleteWalletModalComponent', () => {
  let component: DeleteWalletModalComponent;
  let fixture: ComponentFixture<DeleteWalletModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MaterialModule,
        BrowserAnimationsModule,
        RpcWithStateModule.forRoot(),
        MultiwalletModule.forRoot()
       ],
      declarations: [ DeleteWalletModalComponent ],
      providers: [ { provide: MatDialogRef }, {provide: SettingsStateService, useClass: SettingsStateMockService}, IpcService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteWalletModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Injectable()
class SettingsStateMockService {
  constructor() { }

  currentWallet(): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      observer.next({ name: 'TestWallet', displayname: 'TestWallet', isMarketEnabled: false});
      observer.complete();
    });
  }
}
