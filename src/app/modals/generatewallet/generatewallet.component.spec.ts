import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratewalletComponent } from './generatewallet.component';

describe('GeneratewalletComponent', () => {
  let component: GeneratewalletComponent;
  let fixture: ComponentFixture<GeneratewalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneratewalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratewalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
