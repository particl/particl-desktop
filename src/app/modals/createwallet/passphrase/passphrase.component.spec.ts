import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../../shared/shared.module';
import { RpcModule } from '../../../core/rpc/rpc.module';

import { PassphraseService } from './passphrase.service';

import { FormsModule } from '@angular/forms';
import { FocusDirective } from '../../modals.directives';
import { PassphraseComponent } from './passphrase.component';
import { MaterialModule } from '@angular/material';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";


describe('PassphraseComponent', () => {
  let component: PassphraseComponent;
  let fixture: ComponentFixture<PassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        RpcModule.forRoot(),
        MaterialModule,
        BrowserAnimationsModule
       ],
      declarations: [
        FocusDirective,
        PassphraseComponent
      ],
      providers: [PassphraseService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassphraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should get words', () => {
    expect(component.words).toBeDefined();
  });
});
