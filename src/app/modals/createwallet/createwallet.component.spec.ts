import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../core/rpc/rpc.module';

import { CreateWalletComponent } from './createwallet.component';
import { PasswordComponent } from '../shared/password/password.component';
import { PassphraseComponent } from './passphrase/passphrase.component';
import { FocusDirective } from '../modals.directives';

import { PassphraseService } from '../../core/rpc/passphrase.service';

describe('CreateWalletComponent', () => {
  let component: CreateWalletComponent;
  let fixture: ComponentFixture<CreateWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        PassphraseService
      ],
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        RpcModule.forRoot()
      ],
      declarations: [ 
        CreateWalletComponent, 
        FocusDirective,
        PasswordComponent,
        PassphraseComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should restore', () => {
    // component.restore();
    expect(component.restore).toBeTruthy();
  });

  it('should go back', () => {
    component.back();
    expect(component.back).toBeTruthy();
  });
*/
  it('should get words', () => {
    expect(component.words).toBeDefined();
  });
});
