import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMarketComponent } from './create-market.component';

describe('CreateMarketComponent', () => {
  let component: CreateMarketComponent;
  let fixture: ComponentFixture<CreateMarketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMarketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
