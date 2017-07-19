import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassphraseComponent } from '../shared/passphrase/passphrase.component';
import { ModalsModule } from '../modals.module';

describe('PassphraseComponent', () => {
  let component: PassphraseComponent; // TODO: ????????
  let fixture: ComponentFixture<PassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModalsModule]
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
/*
  it('should unlock', () => {
    component.unlock;
    expect(component.unlock).toBeTruthy();
  });
  */
});
