import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { ListingsComponent } from './listings.component';

describe('ListingsComponent', () => {
  let component: ListingsComponent;
  let fixture: ComponentFixture<ListingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ListingsComponent
      ],
      imports: [
        BrowserAnimationsModule,
        CoreUiModule.forRoot()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
