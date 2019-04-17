import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionComponent } from './version.component';
import { HttpClientModule } from '@angular/common/http';
import { MainModule } from '../main.module';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MockRpcService } from 'app/core/rpc/rpc.mockservice';

describe('VersionComponent', () => {
  let component: VersionComponent;
  let fixture: ComponentFixture<VersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MainModule,
      ],
      providers: [
        { provide: RpcService, useClass: MockRpcService }
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
