import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatIconModule } from '@angular/material';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { WalletBackupModalComponent } from './wallet-backup-modal.component';
import { SettingsStateService } from '../settings-state.service';
import { CoreModule } from 'app/core/core.module';

describe('WalletBackupModalComponent', () => {
  let component: WalletBackupModalComponent;
  let fixture: ComponentFixture<WalletBackupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, MatDialogModule, MatIconModule, CoreModule.forRoot() ],
      declarations: [ WalletBackupModalComponent ],
      providers: [ { provide: MatDialogRef }, {provide: SettingsStateService, useClass: SettingsStateMockService} ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletBackupModalComponent);
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
