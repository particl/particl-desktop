import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTreeComponent } from './category-tree.component';
import { MaterialModule } from '../material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CategoryTreeComponent', () => {
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

  it('should input available/visible', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.debugElement.nativeElement;
    const categoryInput = compiled.querySelector('.header-input');
    expect(categoryInput).toBeTruthy();
  });

  it('should onChangeCall() method close the category drop-down', () => {
    expect(component).toBeTruthy();

    // category-overlay
    component.show();
    fixture.detectChanges();

    // category-overlay
    component.onChangeCall({});
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const categoryOverlayTree = compiled.querySelector('.category-overlay');
    expect(categoryOverlayTree).toBeFalsy();
  });

});
