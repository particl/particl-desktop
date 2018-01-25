import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseNotificationComponent } from './release-notification.component';
import { MainViewModule } from '../main-view.module';
import { HttpClientModule } from '@angular/common/http';

describe('ReleaseNotificationComponent', () => {
  let component: ReleaseNotificationComponent;
  let fixture: ComponentFixture<ReleaseNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MainViewModule,
        HttpClientModule
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
