import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MdCardModule } from '@angular/material';

import { StakinginfoComponent } from './stakinginfo.component';
import { StateService } from '../../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';

import { Amount, Duration } from '../../../shared/util/utils';

describe('StakinginfoComponent', () => {
  let component: StakinginfoComponent;
  let fixture: ComponentFixture<StakinginfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        FlexLayoutModule,
        MdCardModule
      ],
      declarations: [ StakinginfoComponent ],
      providers: [StateService]
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
