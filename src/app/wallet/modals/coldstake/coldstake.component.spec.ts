import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdDialogRef, MdSnackBarModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import {RpcModule} from "../../../core/rpc/rpc.module";
import { ModalsModule } from '../modals.module';

import { FlashNotificationService } from '../../services/flash-notification.service';

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
        FlashNotificationService
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
