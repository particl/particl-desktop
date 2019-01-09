import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { RejectBidComponent } from './reject-bid.component';

describe('RejectBidComponent', () => {
  let component: RejectBidComponent;
  let fixture: ComponentFixture<RejectBidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectBidComponent ],
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
      ],
      providers: [
        { provide: MatDialogRef },
        { provide: MAT_DIALOG_DATA }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
