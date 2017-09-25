import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipModule } from 'ngx-bootstrap';
import { StatusComponent } from './status.component';

import { ModalsModule } from '../../modals/modals.module';
import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../rpc/rpc.module';
import { MaterialModule } from '@angular/material';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusComponent ],
      imports: [
       SharedModule,
       RpcModule.forRoot(),
       TooltipModule.forRoot(),
       ModalsModule,
        MaterialModule
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

  it('should getIconNumber', () => {
    expect(component.getIconNumber()).toBe(0);
  });

  it('should get encryptionStatus', () => {
    expect(component.encryptionStatus).toBe('Locked');
  });
});
