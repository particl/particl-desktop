import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { PreviewListingComponent } from './preview-listing.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

describe('PreviewListingComponent', () => {
  let component: PreviewListingComponent;
  let fixture: ComponentFixture<PreviewListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewListingComponent ],
      imports: [
        CoreUiModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef},
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
