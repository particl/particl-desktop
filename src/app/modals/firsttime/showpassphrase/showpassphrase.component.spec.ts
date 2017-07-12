import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { PassphraseComponent } from '../../shared/passphrase/passphrase.component';
import { ModalsService } from '../../modals.service';
import { ShowpassphraseComponent } from './showpassphrase.component';

import { RpcModule } from '../../../core/rpc/rpc.module';
import { SharedModule } from '../../../shared/shared.module';

describe('ShowpassphraseComponent', () => {
  let component: ShowpassphraseComponent;
  let fixture: ComponentFixture<ShowpassphraseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        RpcModule.forRoot()
       ],
      declarations: [ ShowpassphraseComponent, PassphraseComponent ],
      providers: [ ModalsService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowpassphraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
