import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ModalsModule } from '../modals.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';

import { ColdstakeComponent } from './coldstake.component';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';


describe('ColdstakeComponent', () => {
  let component: ColdstakeComponent;
  let fixture: ComponentFixture<ColdstakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreUiModule.forRoot(),
        CoreModule.forRoot(),
        ModalsModule,
        RpcWithStateModule.forRoot(),
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef }
      ]
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
