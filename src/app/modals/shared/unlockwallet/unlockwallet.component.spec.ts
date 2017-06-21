import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockwalletComponent } from './recoverwallet.component';

describe('UnlockwalletComponent', () => {
  let component: UnlockwalletComponent;
  let fixture: ComponentFixture<UnlockwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnlockwalletComponent ]
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
