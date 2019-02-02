import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionComponent } from './version.component';
import { MainViewModule } from '../main-view.module';
import { HttpClientModule } from '@angular/common/http';

describe('VersionComponent', () => {
  let component: VersionComponent;
  let fixture: ComponentFixture<VersionComponent>;

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
    fixture = TestBed.createComponent(VersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
