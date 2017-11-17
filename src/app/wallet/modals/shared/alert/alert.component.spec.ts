import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdDialogModule, MdDialogRef } from '@angular/material';

import { ModalsModule } from '../../modals.module';
import { SharedModule } from '../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';

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
        MdDialogModule
      ],
      providers: [ { provide: MdDialogRef } ]
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
