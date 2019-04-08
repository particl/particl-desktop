import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { AnnouncementNotificationComponent } from './announcement-notification.component';
import { HttpClientModule } from '@angular/common/http';

describe('AnnouncementNotificationComponent', () => {
  let component: AnnouncementNotificationComponent;
  let fixture: ComponentFixture<AnnouncementNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        HttpClientModule
      ],
      declarations: [AnnouncementNotificationComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
