import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSelectSearchComponent } from './mat-select-search.component';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MatSelectSearchComponent', () => {
  let component: MatSelectSearchComponent;
  let fixture: ComponentFixture<MatSelectSearchComponent>;

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
    fixture = TestBed.createComponent(MatSelectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
