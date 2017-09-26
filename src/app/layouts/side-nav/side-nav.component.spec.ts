import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSideNavComponent } from './side-nav.component';
import {MdDialog, MdDialogModule, MdExpansionModule, MdIconModule} from '@angular/material';
import {ModalsService} from "../../modals/modals.service";

describe('LayoutSideNavComponent', () => {
  let component: LayoutSideNavComponent;
  let fixture: ComponentFixture<LayoutSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdExpansionModule,
        MdIconModule,
        MdDialogModule,
        ModalsService
      ],
      providers: [ MdDialog ],
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
