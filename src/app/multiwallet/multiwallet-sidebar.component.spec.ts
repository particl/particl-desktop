import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MultiwalletSidebarComponent } from './multiwallet-sidebar.component';

import { CoreModule } from '../core/core.module';
import { CoreUiModule } from '../core-ui/core-ui.module';
import { MultiwalletModule } from './multiwallet.module'

describe('MultiwalletSidebarComponent', () => {
  let component: MultiwalletSidebarComponent;
  let fixture: ComponentFixture<MultiwalletSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        MultiwalletModule.forTest()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiwalletSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
