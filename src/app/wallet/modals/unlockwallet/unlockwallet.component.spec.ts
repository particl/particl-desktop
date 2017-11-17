import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdDialogModule, MdDialogRef, MdSnackBarModule } from '@angular/material';

import { ModalsModule } from '../modals.module';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../../core/core.module';

import { UnlockwalletComponent } from './unlockwallet.component';

describe('UnlockwalletComponent', () => {
  let component: UnlockwalletComponent;
  let fixture: ComponentFixture<UnlockwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ModalsModule,
        CoreModule.forRoot(),
        MdDialogModule,
        MdSnackBarModule
      ],
      providers: [ { provide: MdDialogRef } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlockwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
     expect(component).toBeTruthy();
  });
});
