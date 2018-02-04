import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { InstallerModule } from 'app/installer/installer.module';

import { EncryptWalletComponent } from './encrypt-wallet.component';


describe('EncryptWalletComponent', () => {
  let component: EncryptWalletComponent;
  let fixture: ComponentFixture<EncryptWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      // declarations: [ EncryptWalletComponent ]
      imports: [
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        InstallerModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncryptWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
