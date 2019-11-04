import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';

import { InsufficientFundsComponent } from './insufficient-funds.component';

describe('InsufficientFundsComponent', () => {
  let component: InsufficientFundsComponent;
  let fixture: ComponentFixture<InsufficientFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsufficientFundsComponent ],
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [
        /* deps */
        { provide: MatDialogRef}
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsufficientFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



