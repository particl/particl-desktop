import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../../core/core.module';
import { CoreUiModule } from '../../../../../core-ui/core-ui.module';
import { ModalsModule } from '../../../../../modals/modals.module';

import { AddAddressLabelComponent } from './add-address-label.component';

describe('AddAddressLabelComponent', () => {
  let component: AddAddressLabelComponent;
  let fixture: ComponentFixture<AddAddressLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
        SharedModule
      ],
      declarations: [AddAddressLabelComponent],
      providers: [
        { provide: MatDialogRef}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAddressLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
