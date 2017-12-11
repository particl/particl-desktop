import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { ModalsModule } from '../../modals.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../wallet/shared/shared.module';
import { CoreUiModule } from '../../../core-ui/core-ui.module';

import { AlertComponent } from './alert.component';


describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        CoreUiModule.forRoot()
      ],
      providers: [ { provide: MatDialogRef } ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
