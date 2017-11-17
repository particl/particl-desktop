import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdSnackBarModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../../core/core.module';
import { ModalsModule } from '../modals.module';

import { EncryptwalletComponent } from './encryptwallet.component';

describe('EncryptwalletComponent', () => {
  let component: EncryptwalletComponent;
  let fixture: ComponentFixture<EncryptwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ModalsModule,
        CoreModule.forRoot(),
        MdSnackBarModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncryptwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
