import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { ConfirmpassphraseComponent } from './confirmpassphrase.component';
import { PassphraseComponent } from '../../shared/passphrase/passphrase.component';
import { ModalsService } from '../../modals.service';

describe('ConfirmpassphraseComponent', () => {
  let component: ConfirmpassphraseComponent;
  let fixture: ComponentFixture<ConfirmpassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ ConfirmpassphraseComponent, PassphraseComponent ],
      providers: [ ModalsService ]
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

  it('should go back', () => {
    expect(component.back).toBeTruthy();
  });

  it('should go next', () => {
    expect(component.next).toBeTruthy();
  });
});
