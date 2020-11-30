import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotItemComponent } from './bot-item.component';

describe('BotItemComponent', () => {
  let component: BotItemComponent;
  let fixture: ComponentFixture<BotItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
