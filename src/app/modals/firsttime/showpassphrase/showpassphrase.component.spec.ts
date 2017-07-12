import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { ModalsService } from '../../modals.service';
import { ShowpassphraseComponent } from './showpassphrase.component';

describe('ShowpassphraseComponent', () => {
  let component: ShowpassphraseComponent;
  let fixture: ComponentFixture<ShowpassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ ShowpassphraseComponent ],
      providers: [ ModalsService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowpassphraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
