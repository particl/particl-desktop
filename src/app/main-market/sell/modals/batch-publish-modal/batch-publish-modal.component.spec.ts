import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchPublishModalComponent } from './batch-publish-modal.component';

describe('BatchPublishModalComponent', () => {
  let component: BatchPublishModalComponent;
  let fixture: ComponentFixture<BatchPublishModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchPublishModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchPublishModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
