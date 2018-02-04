import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { CoreModule } from '../../../../../core/core.module';
import { CoreUiModule } from '../../../../../core-ui/core-ui.module';
import { MainViewModule } from 'app/wallet/main/main-view.module';
import { ModalsModule } from '../../../../../modals/modals.module';
import { SharedModule } from '../../../../../wallet/shared/shared.module';

import { ConsoleModalComponent } from './console-modal.component';

describe('ConsoleModalComponent', () => {
  let component: ConsoleModalComponent;
  let fixture: ComponentFixture<ConsoleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        MainViewModule,
        ModalsModule,
        SharedModule,
      ],
      providers: [
        /* deps */
        { provide: MatDialogRef}
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
