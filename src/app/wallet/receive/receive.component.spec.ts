import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronService } from 'ngx-electron';

import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angular2-qrcode';

import { SharedModule } from '../../shared/shared.module';
import { ReceiveComponent } from './receive.component';

import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';

describe('ReceiveComponent', () => {
  let component: ReceiveComponent;
  let fixture: ComponentFixture<ReceiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveComponent ],
      imports: [
        FormsModule,
        SharedModule,
        QRCodeModule
      ],
      providers: [
        AppService,
        ElectronService,
        RPCService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
