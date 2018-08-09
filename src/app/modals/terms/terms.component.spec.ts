import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material';
import { TermsComponent } from './terms.component';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { CoreModule } from '../../core/core.module';

describe('TermsComponent', () => {
  let component: TermsComponent;
  let fixture: ComponentFixture<TermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatDialogModule, CoreUiModule.forRoot(), CoreModule.forRoot() ],
      declarations: [ TermsComponent ],
      providers: [
        /* deps */
        { provide: MatDialogRef },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
