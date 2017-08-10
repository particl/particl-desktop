import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaemonComponent } from './daemon.component';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../core/rpc/rpc.module';
import { ModalsService } from '../modals.service';

describe('DaemonComponent', () => {
  let component: DaemonComponent;
  let fixture: ComponentFixture<DaemonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaemonComponent ],
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
      providers: [
        ModalsService
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
