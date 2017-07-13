import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusComponent } from './status.component';
import { TooltipModule } from 'ngx-tooltip';


import { ModalsModule } from '../../modals/modals.module';
import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../rpc/rpc.module';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusComponent ],
      imports: [
       SharedModule,
       RpcModule.forRoot(),
       ModalsModule,
       TooltipModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
