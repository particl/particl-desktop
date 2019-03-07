import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';


import { CoreModule } from '../../core/core.module';
import { MainViewModule } from './main-view.module';
// should be declared in module^
import { MainViewComponent } from './main-view.component';
import { ModalsModule } from '../../modals/modals.module';

import { MatDialogModule, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material'; // TODO: move to material
import { RpcModule } from 'app/core/rpc/rpc.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';

describe('MainViewComponent', () => {
  let component: MainViewComponent;
  let fixture: ComponentFixture<MainViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // CoreUiModule.forRoot(),
        BrowserAnimationsModule,
        RouterTestingModule,
        MainViewModule,
        CoreModule.forRoot(),
        RpcModule.forTest(),
        ModalsModule.forRoot(),
        MultiwalletModule.forTest(),
        MatDialogModule
      ],
      providers: [
        MatDialog
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
