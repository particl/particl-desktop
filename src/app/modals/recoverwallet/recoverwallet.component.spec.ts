import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalsModule } from '../modals.module';

import { StatusService } from '../../core/status/status.service';

import { RecoverwalletComponent } from './recoverwallet.component';

describe('RecoverwalletComponent', () => {
  let component: RecoverwalletComponent;
  let fixture: ComponentFixture<RecoverwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalsModule
      ],
      providers: [
        StatusService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
