import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColdstakeComponent } from './coldstake.component';
import { ModalsModule } from '../../../modals/modals.module';
import { SharedModule } from '../../../shared/shared.module';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MdCardModule, MdProgressBarModule } from '@angular/material';

/* new */
import { CoreModule } from '../../../../core/core.module';

describe('ColdstakeComponent', () => {
  let component: ColdstakeComponent;
  let fixture: ComponentFixture<ColdstakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        /* deps */
        FlexLayoutModule,
        MdCardModule,
        MdProgressBarModule,
        /* own */
        SharedModule,
        ModalsModule,
        CoreModule.forRoot()
      ],
      declarations: [ ColdstakeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdstakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
