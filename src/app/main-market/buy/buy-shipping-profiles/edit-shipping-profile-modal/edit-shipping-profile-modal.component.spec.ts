import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShippingProfileModalComponent } from './edit-shipping-profile-modal.component';

describe('EditShippingProfileModalComponent', () => {
  let component: EditShippingProfileModalComponent;
  let fixture: ComponentFixture<EditShippingProfileModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditShippingProfileModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditShippingProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
