import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { ListingComponent } from './listing.component';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingComponent ],
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
    fixture = TestBed.createComponent(ListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
