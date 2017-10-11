import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakinginfoComponent } from './stakinginfo.component';
import { RpcModule } from '../../../core/rpc/rpc.module';
import { SharedModule } from '../../../shared/shared.module';

describe('StakinginfoComponent', () => {
  let component: StakinginfoComponent;
  let fixture: ComponentFixture<StakinginfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RpcModule.forRoot(),
        SharedModule
      ],
      declarations: [ StakinginfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakinginfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
