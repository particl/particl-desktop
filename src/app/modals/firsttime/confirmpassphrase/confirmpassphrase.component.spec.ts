import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ElectronService } from 'ngx-electron';
import { PeerService } from '../../../core/rpc/peer.service';
import { RPCService } from '../../../core/rpc/rpc.service';
import { StatusService } from '../../../core/status/status.service';
import { ModalsService } from '../../modals.service';

import { ConfirmpassphraseComponent } from './confirmpassphrase.component';
import { PassphraseComponent } from '../../shared/passphrase/passphrase.component';

describe('ConfirmpassphraseComponent', () => {
  let component: ConfirmpassphraseComponent;
  let fixture: ComponentFixture<ConfirmpassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpModule
      ],
      declarations: [
        ConfirmpassphraseComponent,
        PassphraseComponent
      ],
      providers: [
        ElectronService,
        PeerService,
        RPCService,
        StatusService,
        ModalsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmpassphraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
