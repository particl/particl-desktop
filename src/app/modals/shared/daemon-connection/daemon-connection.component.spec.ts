import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaemonConnectionComponent } from './daemon-connection.component';

describe('DaemonConnectionComponent', () => {
  let component: DaemonConnectionComponent;
  let fixture: ComponentFixture<DaemonConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaemonConnectionComponent ]
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
