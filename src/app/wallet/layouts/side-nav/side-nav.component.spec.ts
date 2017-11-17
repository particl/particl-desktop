import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdDialog, MdDialogModule, MdExpansionModule, MdIconModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

import {ModalsService} from '../../modals/modals.service';

import { LayoutSideNavComponent } from './side-nav.component';


describe('LayoutSideNavComponent', () => {
  let component: LayoutSideNavComponent;
  let fixture: ComponentFixture<LayoutSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MdExpansionModule,
        MdIconModule,
        MdDialogModule,
        CoreModule.forRoot(),
        BrowserAnimationsModule
      ],
      providers: [ MdDialog, ModalsService],
      declarations: [ LayoutSideNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
