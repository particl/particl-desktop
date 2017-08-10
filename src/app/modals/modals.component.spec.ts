import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap';

import { ModalsModule } from './modals.module';
import { RpcModule } from '../core/rpc/rpc.module';
import { SharedModule } from '../shared/shared.module';

import { BlockStatusService } from '../core/rpc/blockstatus.service';

import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { ModalsComponent } from './modals.component';


describe('ModalsComponent', () => {
  let component: ModalsComponent;
  let fixture: ComponentFixture<ModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalsModule,
        ModalModule.forRoot(),
        SharedModule,
        RpcModule.forRoot()
      ],
      providers: [
        BlockStatusService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should update progress', () => {
    component.updateProgress(5);
    expect(component.syncPercentage).toBe(5);
  });

  it('should open and close', () => {
    component.open(UnlockwalletComponent);
    expect(component.modal).toBeDefined();
    component.close();
  });

  it('should get closeOnEscape', () => {
    expect(component.closeOnEscape).toBe(true);
  });

  it('should get hasScrollY', () => {
    expect(component.hasScrollY).toBe(false);
  });

  it('should get modal', () => {
    expect(component.modal).toBe(undefined);
  });
});
