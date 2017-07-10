import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverwalletComponent } from './recoverwallet.component';
import { ModalsModule } from '../modals.module';

import { ElectronService } from 'ngx-electron';

import { SharedModule } from '../../shared/shared.module';

import { RPCService } from '../../core/rpc/rpc.service';

describe('RecoverwalletComponent', () => {
  let component: RecoverwalletComponent;
  let fixture: ComponentFixture<RecoverwalletComponent>;

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
    fixture = TestBed.createComponent(RecoverwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
