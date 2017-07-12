import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverwalletComponent } from './recoverwallet.component';
import { ModalsModule } from '../modals.module';

import { RpcModule } from '../../core/rpc/rpc.module';

describe('RecoverwalletComponent', () => {
  let component: RecoverwalletComponent;
  let fixture: ComponentFixture<RecoverwalletComponent>;

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
    fixture = TestBed.createComponent(RecoverwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
