import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';

import { CreateWalletComponent } from './create-wallet.component';
import { ModalsModule } from 'app/modals/modals.module';


describe('CreateWalletComponent', () => {
  let component: CreateWalletComponent;
  let fixture: ComponentFixture<CreateWalletComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef}
      ],
      declarations: [CreateWalletComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
