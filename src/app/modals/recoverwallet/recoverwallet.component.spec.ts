import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverwalletComponent } from './recoverwallet.component';
import { ModalsModule } from '../modals.module';

describe('RecoverwalletComponent', () => {
  let component: RecoverwalletComponent;
  let fixture: ComponentFixture<RecoverwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModalsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should restore', () => {
    expect(component.restore).toBeTruthy();
  });

  it('should go back', () => {
    expect(component.back).toBeTruthy();
  });

  it('should get words', () => {
    expect(component.words).toBeDefined();
  });
});
