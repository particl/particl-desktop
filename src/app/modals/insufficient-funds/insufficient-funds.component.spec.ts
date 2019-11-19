import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { CoreModule, RpcStateService } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';

import { InsufficientFundsComponent } from './insufficient-funds.component';
import { RpcStateServiceMock } from 'app/_test/core-test/rpc-test/rpc-state-mock.service';
import { RouterTestingModule } from '@angular/router/testing';
import { PartoshiAmount } from 'app/core/util/utils';

describe('InsufficientFundsComponent', () => {
  let component: InsufficientFundsComponent;
  let fixture: ComponentFixture<InsufficientFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsufficientFundsComponent ],
      imports: [
        RouterTestingModule,
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [
        /* deps */
        { provide: MatDialogRef }, {
          provide: MAT_DIALOG_DATA,
          useValue: {
            required: new PartoshiAmount(0)
          }
        },
        { provide: RpcStateService, useClass: RpcStateServiceMock },
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsufficientFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



