import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalsModule } from '../../modals.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../wallet/shared/shared.module';
import { CoreUiModule } from '../../../core-ui/core-ui.module';

import { PasswordComponent } from './password.component';


describe('PasswordComponent', () => {
  let component: PasswordComponent;
  let fixture: ComponentFixture<PasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        CoreUiModule.forRoot()
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
