import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreModule } from '../../core/core.module';

import { DaemonComponent } from './daemon.component';


describe('DaemonComponent', () => {
  let component: DaemonComponent;
  let fixture: ComponentFixture<DaemonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaemonComponent ],
      imports: [
        SharedModule,
        CoreModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaemonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
