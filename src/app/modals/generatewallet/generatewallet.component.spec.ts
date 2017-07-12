import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { ElectronService } from 'ngx-electron';
import { PeerService } from '../../core/rpc/peer.service';
import { RPCService } from '../../core/rpc/rpc.service';
import { StatusService } from '../../core/status/status.service';
import { ModalsService } from '../modals.service';

import { GeneratewalletComponent } from './generatewallet.component';
import { PassphraseComponent } from '../shared/passphrase/passphrase.component';
import { PasswordComponent } from '../shared/password/password.component';

describe('GeneratewalletComponent', () => {
  let component: GeneratewalletComponent;
  let fixture: ComponentFixture<GeneratewalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        FormsModule
      ],
      declarations: [
        GeneratewalletComponent,
        PassphraseComponent,
        PasswordComponent
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
    fixture = TestBed.createComponent(GeneratewalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
