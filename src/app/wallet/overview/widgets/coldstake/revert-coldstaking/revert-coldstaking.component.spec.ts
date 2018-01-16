import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { RpcModule } from '../../../../../core/rpc/rpc.module';
import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../../core/core.module'

import { CoreUiModule } from '../../../../../core-ui/core-ui.module';
import { ModalsService } from '../../../../../modals/modals.service';

import { RevertColdstakingComponent } from './revert-coldstaking.component';

describe('RevertColdstakingComponent', () => {
  let component: RevertColdstakingComponent;
  let fixture: ComponentFixture<RevertColdstakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RpcModule.forRoot(),
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      declarations: [ RevertColdstakingComponent ],
      providers: [{ provide: MatDialogRef}, ModalsService],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevertColdstakingComponent);
    component = fixture.componentInstance;
    component.utxos = {
      txs: [],
      amount: 0
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
