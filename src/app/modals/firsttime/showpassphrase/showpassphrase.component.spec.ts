import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ElectronService } from 'ngx-electron';
import { PeerService } from '../../../core/rpc/peer.service';
import { RPCService } from '../../../core/rpc/rpc.service';
import { StatusService } from '../../../core/status/status.service';
import { ModalsService } from '../../modals.service';

import { PassphraseComponent } from '../../shared/passphrase/passphrase.component';
import { ShowpassphraseComponent } from './showpassphrase.component';

describe('ShowpassphraseComponent', () => {
  let component: ShowpassphraseComponent;
  let fixture: ComponentFixture<ShowpassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        FormsModule
      ],
      declarations: [
        PassphraseComponent,
        ShowpassphraseComponent
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
    fixture = TestBed.createComponent(ShowpassphraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
