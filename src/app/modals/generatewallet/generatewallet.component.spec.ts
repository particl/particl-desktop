import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

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
        FormsModule
      ],
      declarations: [
        GeneratewalletComponent,
        PassphraseComponent,
        PasswordComponent
      ],
      providers: [
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
