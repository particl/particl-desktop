import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassphraseComponent } from '../shared/passphrase/passphrase.component';
import { ModalsModule } from '../modals.module';
import { SharedModule } from '../../shared/shared.module';

import { ElectronService } from 'ngx-electron';
import { RPCService } from '../../core/rpc/rpc.service';


describe('PassphraseComponent', () => {
  let component: PassphraseComponent;
  let fixture: ComponentFixture<PassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, ModalsModule],
      providers: [
        ElectronService,
        RPCService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassphraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
