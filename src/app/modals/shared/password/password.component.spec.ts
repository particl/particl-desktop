import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalsModule } from '../../modals.module';
import { PasswordComponent } from './password.component';

describe('UnlockwalletComponent', () => {
  let component: PasswordComponent;
  let fixture: ComponentFixture<PasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModalsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should get password input type', () => {
    component.passwordInputType();
    expect(component.password).toBeUndefined();
  });

  it('should unlock', () => {
    component.unlock();
    expect(component.password).toBeUndefined();
  });

  it('should get showPass', () => {
    expect(component.showPass).toBe(false);
  });
});
