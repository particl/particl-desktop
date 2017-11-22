import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreUiModule } from '../core-ui.module';
import { MainViewModule } from './main-view.module';

import { MainViewComponent } from './main-view.component';

describe('MainViewComponent', () => {
  let component: MainViewComponent;
  let fixture: ComponentFixture<MainViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreUiModule.forRoot(),
        MainViewModule
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
