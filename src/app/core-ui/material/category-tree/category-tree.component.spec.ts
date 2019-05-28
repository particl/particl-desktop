import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { CategoryTreeComponent } from './category-tree.component';
import { MaterialModule } from '../material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

fdescribe('CategoryTreeComponent', () => {
  let component: CategoryTreeComponent;
  let fixture: ComponentFixture<CategoryTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show() method open the category drop-down', fakeAsync(() => {
    expect(component).toBeTruthy();
    const compiled = fixture.debugElement.nativeElement;
    const categoryOverlayTree = compiled.querySelector('.category-overlay');
    expect(categoryOverlayTree).toBeFalsy();

    // category-overlay
    component.show();
    fixture.detectChanges();

  }));


});
