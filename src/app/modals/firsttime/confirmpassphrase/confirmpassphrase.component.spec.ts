import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

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
        FormsModule
      ],
      declarations: [
        ConfirmpassphraseComponent,
        PassphraseComponent
      ],
      providers: [
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
