import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeWithSearchComponent } from './tree-with-search.component';

describe('TreeWithSearchComponent', () => {
  let component: TreeWithSearchComponent;
  let fixture: ComponentFixture<TreeWithSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeWithSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeWithSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
