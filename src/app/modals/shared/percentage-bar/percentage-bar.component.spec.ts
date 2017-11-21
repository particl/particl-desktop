import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdDialogModule } from '@angular/material';

import { CoreModule } from '../../../core/core.module';
import { ModalsModule } from '../../modals.module';
import { SharedModule } from '../../../shared/shared.module'; // fix

import { PercentageBarComponent } from './percentage-bar.component';


describe('PercentageBarComponent', () => {
  let component: PercentageBarComponent;
  let fixture: ComponentFixture<PercentageBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        MdDialogModule
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
