import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { TermsComponent } from './terms.component';

describe('TermsComponent', () => {
  let component: TermsComponent;
  let fixture: ComponentFixture<TermsComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsComponent ],
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [
        /* deps */
        { provide: MatDialogRef }
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
