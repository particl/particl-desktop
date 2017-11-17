/* modules (deps) */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdDialogRef, MdIconModule, MdSnackBarModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* modules (own) */
import { SharedModule } from '../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';

/* services (own) */
import { PassphraseService } from './passphrase.service';
import { FlashNotificationService } from '../../../services/flash-notification.service';

/* components & directives (own) */
import { FocusDirective } from '../../modals.directives';
import { PassphraseComponent } from './passphrase.component';


/* delete any unused imports! */

describe('PassphraseComponent', () => {
  let component: PassphraseComponent;
  let fixture: ComponentFixture<PassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
       /* own */
        SharedModule,
        CoreModule.forRoot(),
        /* deps */
        FormsModule,
        BrowserAnimationsModule,
        MdIconModule,
        MdSnackBarModule
       ],
      declarations: [
        FocusDirective,
        PassphraseComponent
      ],
      providers: [
        /* own */
        PassphraseService,
        FlashNotificationService,
        /* deps */
        { provide: MdDialogRef},
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
