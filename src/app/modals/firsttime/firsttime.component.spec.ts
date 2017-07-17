import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RpcModule } from '../../core/rpc/rpc.module';
import { SharedModule } from '../../shared/shared.module';

import { BlockStatusService } from '../../core/rpc/blockstatus.service';
import { ModalsService } from '../modals.service';

import { FirsttimeComponent } from './firsttime.component';

describe('FirsttimeComponent', () => {
  let component: FirsttimeComponent;
  let fixture: ComponentFixture<FirsttimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
      declarations: [
        FirsttimeComponent
      ],
      providers: [
        BlockStatusService,
        ModalsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirsttimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
