import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Location, LocationStrategy } from '@angular/common';

import { SyncingModalComponent } from './syncing.modal.component';

describe('SyncingModalComponent', () => {
  let component: SyncingModalComponent;
  let fixture: ComponentFixture<SyncingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ SyncingModalComponent ],
      providers: [ Location ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
