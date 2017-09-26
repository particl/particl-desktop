import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddressLabelComponent } from './add-address-label.component';
import { FormsModule } from '@angular/forms';
import { MdDialogModule } from '@angular/material';

describe('AddAddressLabelComponent', () => {
  let component: AddAddressLabelComponent;
  let fixture: ComponentFixture<AddAddressLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, MdDialogModule ],
      declarations: [ AddAddressLabelComponent ]
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
