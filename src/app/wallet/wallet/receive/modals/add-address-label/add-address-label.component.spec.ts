import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdDialogModule, MdDialogRef, MdFormFieldModule, MdInputModule, MdSnackBarModule } from '@angular/material';

import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule, SnackbarService } from '../../../../../core/core.module';
import { CoreUiModule } from '../../../../../core-ui/core-ui.module';
import { ModalsModule, ModalsService } from '../../../../../modals/modals.module';

import { AddAddressLabelComponent } from './add-address-label.component';



describe('AddAddressLabelComponent', () => {
  let component: AddAddressLabelComponent;
  let fixture: ComponentFixture<AddAddressLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MdDialogModule,
        FormsModule,
        MdFormFieldModule,
        MdSnackBarModule,
        MdInputModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
        SharedModule
      ],
      declarations: [AddAddressLabelComponent],
      providers: [
        ModalsService,
        SnackbarService,
        { provide: MdDialogRef}
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
