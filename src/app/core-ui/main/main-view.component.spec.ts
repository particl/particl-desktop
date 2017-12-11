import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';


import { CoreModule } from '../../core/core.module';
import { MainViewModule } from './main-view.module';
// should be declared in module^
import { MainViewComponent } from './main-view.component';
import { ModalsModule } from '../../modals/modals.module';

import { MatDialogModule, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material'; // TODO: move to material

describe('MainViewComponent', () => {
  let component: MainViewComponent;
  let fixture: ComponentFixture<MainViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // CoreUiModule.forRoot(),
        MainViewModule,
        RouterTestingModule,
        CoreModule.forRoot(),
        ModalsModule.forRoot(),
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
