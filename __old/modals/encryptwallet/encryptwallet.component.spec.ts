import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { CoreModule } from '../../core/core.module';
import { ModalsModule } from '../modals.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';

import { EncryptwalletComponent } from './encryptwallet.component';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('EncryptwalletComponent', () => {
  let component: EncryptwalletComponent;
  let fixture: ComponentFixture<EncryptwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        ModalsModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        RpcWithStateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncryptwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
