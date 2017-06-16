import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';

import { Location, LocationStrategy } from '@angular/common';

import { ModalComponent } from './modal.component';
import { ModalService } from './modal.service';

/* TODO useful ?*/
import { SharedModule } from '../shared.module';

describe('SettingsComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, SharedModule ],
      declarations: [ ModalComponent ],
      providers: [ ModalService, Location ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
