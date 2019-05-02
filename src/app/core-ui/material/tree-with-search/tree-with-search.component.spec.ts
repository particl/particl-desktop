import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeWithSearchComponent } from './tree-with-search.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TreeWithSearchComponent', () => {
  let component: TreeWithSearchComponent;
  let fixture: ComponentFixture<TreeWithSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreUiModule.forRoot(),
        BrowserAnimationsModule
      ]
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
