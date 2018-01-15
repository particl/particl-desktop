import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { ModalsModule } from '../../modals.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../wallet/shared/shared.module';
import { CoreUiModule } from '../../../core-ui/core-ui.module';

import { DaemonConnectionComponent } from './daemon-connection.component';

describe('DaemonConnectionComponent', () => {
  let component: DaemonConnectionComponent;
  let fixture: ComponentFixture<DaemonConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        CoreUiModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaemonConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
