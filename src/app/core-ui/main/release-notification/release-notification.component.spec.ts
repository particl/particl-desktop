import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseNotificationComponent } from './release-notification.component';

import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from 'app/core/core.module';

describe('ReleaseNotificationComponent', () => {
  let component: ReleaseNotificationComponent;
  let fixture: ComponentFixture<ReleaseNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CoreModule.forTest()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
