import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../wallet/shared/shared.module';
import { ModalsModule } from '../../../modals/modals.module';
import { CoreUiModule } from '../../core-ui.module';

import { StatusComponent } from './status.component';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        CoreUiModule.forRoot()
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
