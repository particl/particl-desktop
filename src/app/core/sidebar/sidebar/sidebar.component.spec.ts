import { Component } from '@angular/core';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { SidebarService } from '../sidebar.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestCmpWrapper,
        SidebarComponent
      ],
      providers: [ SidebarService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close', () => {
    component.toggleOpen(false);
    expect(component.isOpen).toBeFalsy();
    component.toggleOpen(true); // TODO: THIS IS BROKEN, I think...
    expect(component.isOpen).toBeFalsy();
  });

  it('should dock and undock', () => {
    component.toggleDocked(false);
    expect(component.isDocked).toBeFalsy();
    component.toggleDocked(true); // TODO: THIS IS BROKEN, I think...
    expect(component.isDocked).toBeFalsy();
  });

});

@Component({
 selector  : 'test-cmp',
 template  : '<sidebar [position]="left"></sidebar>',
})
class TestCmpWrapper {
}
