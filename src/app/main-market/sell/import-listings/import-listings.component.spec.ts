import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportListingsComponent } from './import-listings.component';

describe('ImportListingsComponent', () => {
  let component: ImportListingsComponent;
  let fixture: ComponentFixture<ImportListingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportListingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
