import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCustomUiEbayComponent } from './ebay-scraper.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { FormGroup, FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ImportCustomUiEbayComponent', () => {
  let component: ImportCustomUiEbayComponent;
  let fixture: ComponentFixture<ImportCustomUiEbayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportCustomUiEbayComponent ],
      imports: [
        BrowserAnimationsModule,
        CoreUiModule.forRoot(),
      ],
      providers: [],
      schemas: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCustomUiEbayComponent);
    component = fixture.componentInstance;
    component.import = {
      form: new FormGroup({
        listings_to_scrape: new FormControl()
      })
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
