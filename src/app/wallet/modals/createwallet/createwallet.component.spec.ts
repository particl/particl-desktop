import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../../core/core.module';

import { CreateWalletComponent } from './createwallet.component';
import { ModalsModule } from '../modals.module';
import { MdSnackBarModule } from '@angular/material';

describe('CreateWalletComponent', () => {
  let component: CreateWalletComponent;
  let fixture: ComponentFixture<CreateWalletComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        CoreModule.forRoot(),
        ModalsModule,
        MdSnackBarModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should restore', () => {
    // component.restore();
    expect(component.restore).toBeTruthy();
  });

  it('should go back', () => {
    component.back();
    expect(component.back).toBeTruthy();
  });
*/
  it('should get words', () => {
    expect(component.words).toBeDefined();
  });
});
