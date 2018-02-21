import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../../core/core.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';
import { SharedModule } from '../../../shared/shared.module';

import { StakinginfoComponent } from './stakinginfo.component';

import { Amount, Duration } from '../../../../core/util/utils';

describe('StakinginfoComponent', () => {
  let component: StakinginfoComponent;
  let fixture: ComponentFixture<StakinginfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
      ],
      declarations: [ StakinginfoComponent ],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakinginfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
