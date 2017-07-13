import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronService } from 'ngx-electron';

import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angular2-qrcode';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../core/rpc/rpc.module';

import { ReceiveComponent } from './receive.component';


describe('ReceiveComponent', () => {
  let component: ReceiveComponent;
  let fixture: ComponentFixture<ReceiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveComponent ],
      imports: [
        FormsModule,
        SharedModule,
        QRCodeModule,
        RpcModule.forRoot()
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
