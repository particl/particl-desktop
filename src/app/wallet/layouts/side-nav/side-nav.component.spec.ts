import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSideNavComponent } from './side-nav.component';
import { MdDialog, MdDialogModule, MdExpansionModule, MdIconModule } from '@angular/material';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
      providers: [ MdDialog],
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
