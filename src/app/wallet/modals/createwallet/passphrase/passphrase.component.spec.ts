import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdDialogRef, MdIconModule, MdSnackBarModule } from '@angular/material';

import { SharedModule } from '../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';

import { PassphraseService } from './passphrase.service';
import { FlashNotificationService } from '../../../services/flash-notification.service';

import { FocusDirective } from '../../modals.directives';
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
        BrowserAnimationsModule,
        MdIconModule,
        MdSnackBarModule
       ],
      declarations: [
        FocusDirective,
        PassphraseComponent
      ],
      providers: [
        { provide: MdDialogRef},
        PassphraseService,
        FlashNotificationService
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
