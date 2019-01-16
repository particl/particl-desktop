import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { AlphaMainnetWarningComponent } from './alpha-mainnet-warning.component';

describe('AlphaMainnetWarningComponent', () => {
  let component: AlphaMainnetWarningComponent;
  let fixture: ComponentFixture<AlphaMainnetWarningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlphaMainnetWarningComponent ],
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
    fixture = TestBed.createComponent(AlphaMainnetWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
