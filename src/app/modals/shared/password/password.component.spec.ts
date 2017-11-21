import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalsModule } from '../../modals.module';
import { PasswordComponent } from './password.component';


import { SharedModule } from '../../../shared/shared.module';
import { CoreModule } from '../../../core/core.module';
import { MdSnackBarModule } from '@angular/material';


describe('PasswordComponent', () => {
  let component: PasswordComponent;
  let fixture: ComponentFixture<PasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        MdSnackBarModule
      ]
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
    component.getInputType();
    expect(component.getInputType()).toBe('password');
  });

  it('should get showPass', () => {
    expect(!component.showPass).toBeTruthy();
  });

  /* TODO: Can't do RPC yet
  it('should unlock', () => {
    component.unlock();
    expect(component.password).toBe('');
  });*/
});
