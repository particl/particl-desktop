import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { RpcModule } from '../../../../../core/rpc/rpc.module';
import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../../core/core.module'

import { CoreUiModule } from '../../../../../core-ui/core-ui.module';

import { RevertColdstakingComponent } from './revert-coldstaking.component';
import { ModalsHelperService } from 'app/modals/modals-helper.service';

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
      providers: [{ provide: MatDialogRef}, ModalsHelperService],
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
