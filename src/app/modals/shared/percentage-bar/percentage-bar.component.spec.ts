import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { CoreUiModule } from '../../../core-ui/core-ui.module';
import { SharedModule } from '../../../wallet/shared/shared.module';

import { PercentageBarComponent } from './percentage-bar.component';
import { MainViewModule } from 'app/core-ui/main/main-view.module';

describe('PercentageBarComponent', () => {
  let component: PercentageBarComponent;
  let fixture: ComponentFixture<PercentageBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        MainViewModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentageBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update progress', () => {
    component.updateProgress(5);
    expect(component.syncPercentage).toEqual(5);
  });
});
