import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionComponent } from './version.component';
import { HttpClientModule } from '@angular/common/http';
import { MainModule } from '../main.module';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MockRpcService } from 'app/core/rpc/rpc.mockservice';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { SettingsModule } from 'app/settings/settings.module';

describe('VersionComponent', () => {
  let component: VersionComponent;
  let fixture: ComponentFixture<VersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MainModule,
        MultiwalletModule.forRoot(),
        SettingsModule.forRoot()
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
