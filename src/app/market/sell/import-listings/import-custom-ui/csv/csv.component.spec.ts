import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCustomUiCsvComponent } from './csv.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialFileInputModule } from 'ngx-material-file-input';

describe('ImportCustomUiCsvComponent', () => {
  let component: ImportCustomUiCsvComponent;
  let fixture: ComponentFixture<ImportCustomUiCsvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportCustomUiCsvComponent ],
      imports: [
        BrowserAnimationsModule,
        MaterialFileInputModule,
        CoreUiModule.forRoot(),
      ],
      providers: [],
      schemas: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCustomUiCsvComponent);
    component = fixture.componentInstance;
    component.import = {
      form: new FormGroup({
        file: new FormControl('', Validators.required)
      })
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
