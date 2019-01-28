import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { AnnounceMentNotificationComponent } from './announcement-notification.component';
import { MainViewModule } from '../main-view.module';
import { HttpClientModule } from '@angular/common/http';

describe('AnnounceMentNotificationComponent', () => {
  let component: AnnounceMentNotificationComponent;
  let fixture: ComponentFixture<AnnounceMentNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        MainViewModule,
        HttpClientModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnounceMentNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
