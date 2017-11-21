import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdDialogRef, MdSnackBarModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../../core/rpc/rpc.module';
import { ModalsModule } from '../modals.module';

<<<<<<< HEAD:src/app/modals/coldstake/coldstake.component.spec.ts
import { ColdstakeComponent } from './coldstake.component';
import { SnackbarService } from '../../core/snackbar/snackbar.service';
=======
import { FlashNotificationService } from '../../services/flash-notification.service';
import { IpcService } from '../../../core/ipc/ipc.service';

import { ColdstakeComponent } from './coldstake.component';
>>>>>>> restructure-particl:src/app/wallet/modals/coldstake/coldstake.component.spec.ts

describe('ColdstakeComponent', () => {
  let component: ColdstakeComponent;
  let fixture: ComponentFixture<ColdstakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        RpcModule.forRoot(),
        ModalsModule,
        MdSnackBarModule
      ],
      providers: [
        { provide: MdDialogRef},
<<<<<<< HEAD:src/app/modals/coldstake/coldstake.component.spec.ts
        SnackbarService
=======
        FlashNotificationService,
        IpcService
>>>>>>> restructure-particl:src/app/wallet/modals/coldstake/coldstake.component.spec.ts
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdstakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
