import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateMarketsComponent } from './private-markets.component';

describe('PrivateMarketsComponent', () => {
  let component: PrivateMarketsComponent;
  let fixture: ComponentFixture<PrivateMarketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivateMarketsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateMarketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
