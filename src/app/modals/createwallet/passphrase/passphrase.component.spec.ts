import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../../shared/shared.module';
import { RpcModule } from '../../../core/rpc/rpc.module';

import { FormsModule } from '@angular/forms';
import { FocusDirective } from '../../modals.directives';
import { PassphraseComponent } from './passphrase.component';


describe('PassphraseComponent', () => {
  let component: PassphraseComponent;
  let fixture: ComponentFixture<PassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        RpcModule.forRoot()
       ],
      declarations: [ FocusDirective, PassphraseComponent ]
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
