import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatDialogRef } from '@angular/material';

import { CoreModule } from '../../../../../core/core.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ModalsModule } from '../../../../../modals/modals.module';
import { CoreUiModule } from '../../../../../core-ui/core-ui.module';

import { AddressService } from '../../../shared/address.service';

import { NewAddressModalComponent } from './new-address-modal.component';

describe('NewAddressModalComponent', () => {
  let component: NewAddressModalComponent;
  let fixture: ComponentFixture<NewAddressModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        ModalsModule.forRoot(),
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      declarations: [ NewAddressModalComponent ],
      providers: [
        /* deps */
        { provide: MatDialogRef},
        /* own */
        AddressService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAddressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
