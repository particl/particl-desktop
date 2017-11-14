import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusComponent } from './status.component';

import { ModalsModule } from '../../modals/modals.module';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';
import { MdTooltipModule } from '@angular/material';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusComponent ],
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        MdTooltipModule
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
