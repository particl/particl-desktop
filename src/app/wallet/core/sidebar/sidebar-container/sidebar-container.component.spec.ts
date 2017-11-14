import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarContainerComponent } from './sidebar-container.component';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarService } from '../sidebar.service';

describe('SidebarContainerComponent', () => {
  let component: SidebarContainerComponent;
  let fixture: ComponentFixture<SidebarContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarContainerComponent, SidebarComponent ],
      providers: [ SidebarService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', async(() => {
    expect(component).toBeTruthy();
  }));
});
