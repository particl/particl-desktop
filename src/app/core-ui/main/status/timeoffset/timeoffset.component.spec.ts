import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../../core/core.module';
import { CoreUiModule } from '../../../core-ui.module';

import { TimeoffsetComponent } from './timeoffset.component';
import { MainViewModule } from '../../main-view.module';

describe('TimeoffsetComponent', () => {
  let component: TimeoffsetComponent;
  let fixture: ComponentFixture<TimeoffsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        MainViewModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeoffsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
