import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdDialogRef, MdSnackBarModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module'; // fix
import { RpcModule } from '../../core/rpc/rpc.module';
import { ModalsModule } from '../modals.module';

import { SnackbarService } from '../../core/snackbar/snackbar.service';
import { IpcService } from '../../../core/ipc/ipc.service';

import { ColdstakeComponent } from './coldstake.component';


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

        SnackbarService
        IpcService

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
