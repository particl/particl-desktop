import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../core/rpc/rpc.module';

import { EncryptwalletComponent } from './encryptwallet.component';
import { ModalsModule } from '../modals.module';


describe('EncryptwalletComponent', () => {
  let component: EncryptwalletComponent;
  let fixture: ComponentFixture<EncryptwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ModalsModule,
        RpcModule.forRoot()
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
