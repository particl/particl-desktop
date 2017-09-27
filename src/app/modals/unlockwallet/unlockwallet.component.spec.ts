import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockwalletComponent } from './unlockwallet.component';
import { ModalsModule } from '../modals.module';
import { SharedModule } from '../../shared/shared.module';

import { RpcModule } from '../../core/rpc/rpc.module';
import {MdDialogModule, MdDialogRef, MdSnackBarModule} from '@angular/material';


describe('UnlockwalletComponent', () => {
  let component: UnlockwalletComponent;
  let fixture: ComponentFixture<UnlockwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ModalsModule,
        RpcModule.forRoot(),
        MdDialogModule,
        MdSnackBarModule
      ],
      providers: [ { provide: MdDialogRef } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlockwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
     expect(component).toBeTruthy();
  });
});
