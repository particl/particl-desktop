import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { OverviewListingsComponent } from './overview-listings.component';

describe('OverviewListingsComponent', () => {
  let component: OverviewListingsComponent;
  let fixture: ComponentFixture<OverviewListingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        OverviewListingsComponent
      ],
      imports: [
        CoreUiModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
