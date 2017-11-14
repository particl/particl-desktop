import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule, BlockStatusService } from '../../core/core.module';
// TODO;: ^why blockstatus & providing it?

import { ModalsModule } from './modals.module';
import { SharedModule } from '../shared/shared.module';

import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { ModalsComponent } from './modals.component';
import { MdDialogModule, MdDialogRef, MdSnackBarModule } from '@angular/material';
import { ModalsService } from './modals.service';


describe('ModalsComponent', () => {
  let component: ModalsComponent;
  let fixture: ComponentFixture<ModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdDialogModule,
        ModalsModule,
        SharedModule,
        CoreModule.forRoot(),
        MdSnackBarModule
      ],
      providers: [
        BlockStatusService,
        ModalsService,
        { provide: MdDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close', () => {
    component.open(UnlockwalletComponent, {forceOpen: true});
    expect(component.modal).toBeDefined();
    // component.close();
  });

  it('should get closeOnEscape', () => {
    expect(component.closeOnEscape).toBeTruthy()
  });

  it('should get hasScrollY', () => {
    expect(component.hasScrollY).toBeFalsy();
  });

  it('should get modal', () => {
    expect(component.modal).toBeUndefined()
  });
});
