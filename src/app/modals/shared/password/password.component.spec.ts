import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalsModule } from '../../modals.module';
import { PasswordComponent } from './password.component';


import { ElectronService } from 'ngx-electron';
import { SharedModule } from '../../../shared/shared.module';
import { RPCService } from '../../../core/rpc/rpc.service';


describe('UnlockwalletComponent', () => {
  let component: PasswordComponent;
  let fixture: ComponentFixture<PasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, ModalsModule],
      providers: [
        ElectronService,
        RPCService
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
});
