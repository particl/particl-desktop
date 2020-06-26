import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMarketModalComponent } from './edit-market-modal.component';

describe('EditMarketModalComponent', () => {
  let component: EditMarketModalComponent;
  let fixture: ComponentFixture<EditMarketModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMarketModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMarketModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
