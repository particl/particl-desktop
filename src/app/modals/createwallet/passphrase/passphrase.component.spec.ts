import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdDialogRef, MdIconModule, MdSnackBarModule } from '@angular/material';

import { CoreModule, SnackbarService } from '../../../core/core.module';
import { SharedModule } from '../../../wallet/shared/shared.module';
import { ModalsModule, PassphraseService } from '../../modals.module';

import { PassphraseComponent } from './passphrase.component';

describe('PassphraseComponent', () => {
  let component: PassphraseComponent;
  let fixture: ComponentFixture<PassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule.forRoot(),
        BrowserAnimationsModule,
        MdIconModule,
        MdSnackBarModule
       ],
      providers: [
        { provide: MdDialogRef},
        PassphraseService,
        SnackbarService
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

  it('should get words', () => {
    expect(component.words).toBeDefined();
  });
});
