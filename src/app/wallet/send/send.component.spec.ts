import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendComponent } from './send.component';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet.module';

describe('SendComponent', () => {
  let component: SendComponent;
  let fixture: ComponentFixture<SendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
         SharedModule,
         WalletModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
