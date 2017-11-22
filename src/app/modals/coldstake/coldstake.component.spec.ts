import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdDialogRef, MdSnackBarModule } from '@angular/material';

import { ModalsModule } from '../modals.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { CoreModule, SnackbarService, IpcService } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';

import { ColdstakeComponent } from './coldstake.component';


describe('ColdstakeComponent', () => {
  let component: ColdstakeComponent;
  let fixture: ComponentFixture<ColdstakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        CoreUiModule.forRoot(),
        CoreModule.forRoot(),
        ModalsModule,
        MdSnackBarModule
      ],
      providers: [
        { provide: MdDialogRef },
        SnackbarService,
        IpcService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdstakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
