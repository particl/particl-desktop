import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeWithSearchSingleSelectionComponent } from './tree-with-search-single-selection.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { categories } from 'app/_test/core-test/market-test/category-test/mock-data';
import { Category } from 'app/core/market/api/category/category.model';
import { ChecklistDatabaseService } from '../checklist-database.service';
import { ItemFlatNode } from '../model/item-flat-node';

describe('TreeWithSearchSingleSelectionComponent', () => {
  let component: TreeWithSearchSingleSelectionComponent;
  let fixture: ComponentFixture<TreeWithSearchSingleSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreUiModule.forRoot()
      ],
      providers: [
        ChecklistDatabaseService
      ]
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

  it('should tree mat ready for use after init component action.', () => {
    expect(component).toBeTruthy();
    component.options = categories.map(cat => new Category(cat));
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should todoLeafItemSelectionToggle toggle the tree', () => {
    expect(component).toBeTruthy();

    component.options = categories.map(cat => new Category(cat));
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    const node = new ItemFlatNode();
    node.id = 3;
    node.level = 1;
    node.item = 'Particl';

    // toggle tree.
    component.todoLeafItemSelectionToggle(node);
    fixture.detectChanges();

    // toggle again
    component.todoLeafItemSelectionToggle(node);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

});
