import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockwalletComponent } from '../../modals/unlockwallet/unlockwallet.component';
import { ModalsModule } from '../modals.module';
import { SharedModule } from '../../shared/shared.module';

import { RpcModule } from '../../core/rpc/rpc.module';


describe('PassphraseComponent', () => {
  let component: UnlockwalletComponent;
  let fixture: ComponentFixture<UnlockwalletComponent>;

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
    fixture = TestBed.createComponent(UnlockwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should unlock', () => {
    //component.unlock()
    expect(component.unlock).toBeTruthy();
  });

});
