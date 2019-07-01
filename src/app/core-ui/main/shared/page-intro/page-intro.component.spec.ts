import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageIntroComponent } from './page-intro.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PageIntroComponent', () => {
  let component: PageIntroComponent;
  let fixture: ComponentFixture<PageIntroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      declarations: [ PageIntroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
