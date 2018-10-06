import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComponent } from './help.component';
import { SharedModule } from '../shared/shared.module';


import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreUiModule.forRoot(),
        SharedModule,
        BrowserAnimationsModule
      ],
      declarations: [ HelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
