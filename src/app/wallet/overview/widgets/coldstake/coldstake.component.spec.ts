import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MdCardModule, MdProgressBarModule } from '@angular/material';

import { SharedModule } from '../../../shared/shared.module';
import { CoreModule } from '../../../../core/core.module';
import { ModalsModule } from '../../../../modals/modals.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';

import { ColdstakeComponent } from './coldstake.component';



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
        ModalsModule.forRoot(),
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
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
