/* modules (deps) */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MatIconModule } from '@angular/material';

import { PassphraseService } from './passphrase.service'

/* modules (own) */
import { SharedModule } from '../../../wallet/shared/shared.module';
import { CoreModule } from '../../../core/core.module';
import { CoreUiModule } from '../../../core-ui/core-ui.module';

/* components & directives (own) */
import { PassphraseComponent } from './passphrase.component';
import { DirectiveModule } from 'app/core-ui/directive/directive.module';

/* delete any unused imports! */

describe('PassphraseComponent', () => {
  let component: PassphraseComponent;
  let fixture: ComponentFixture<PassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
       /* own */
        SharedModule,
        CoreModule.forTest(),
        CoreUiModule.forRoot(),
        DirectiveModule,
        /* deps */
        BrowserAnimationsModule,
        MatIconModule,
       ],
      providers: [
        /* own */
        PassphraseService
      ],
      declarations: [PassphraseComponent]
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
