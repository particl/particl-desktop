import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotDetailModalComponent } from './bot-detail-modal.component';

describe('BotDetailModalComponent', () => {
  let component: BotDetailModalComponent;
  let fixture: ComponentFixture<BotDetailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotDetailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
