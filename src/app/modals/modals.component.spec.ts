import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { CoreModule, BlockStatusService } from '../core/core.module';
// TODO;: ^why blockstatus & providing it?
import { ModalsModule, ModalsService } from './modals.module';
import { SharedModule } from '../wallet/shared/shared.module';
import { CoreUiModule } from '../core-ui/core-ui.module';

import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { ModalsComponent } from './modals.component';



describe('ModalsComponent', () => {
  let component: ModalsComponent;
  let fixture: ComponentFixture<ModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalsModule.forRoot(),
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [
        BlockStatusService,
        ModalsService,
        { provide: MatDialogRef }
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
