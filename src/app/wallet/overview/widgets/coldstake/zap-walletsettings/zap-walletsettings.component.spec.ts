import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZapWalletsettingsComponent } from './zap-walletsettings.component';

describe('ZapWalletsettingsComponent', () => {
  let component: ZapWalletsettingsComponent;
  let fixture: ComponentFixture<ZapWalletsettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZapWalletsettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZapWalletsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
