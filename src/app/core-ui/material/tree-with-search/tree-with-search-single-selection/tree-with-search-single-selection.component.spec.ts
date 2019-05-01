import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeWithSearchSingleSelectionComponent } from './tree-with-search-single-selection.component';

describe('TreeWithSearchSingleSelectionComponent', () => {
  let component: TreeWithSearchSingleSelectionComponent;
  let fixture: ComponentFixture<TreeWithSearchSingleSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeWithSearchSingleSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeWithSearchSingleSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
