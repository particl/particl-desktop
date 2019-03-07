import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { VersionComponent } from './version.component';
import { MainViewModule } from '../main-view.module';
import { HttpClientModule } from '@angular/common/http';
import { RpcModule } from 'app/core/rpc/rpc.module';
import { MarketModule } from 'app/core/market/market.module';
import { CoreModule } from 'app/core/core.module';

describe('VersionComponent', () => {
  let component: VersionComponent;
  let fixture: ComponentFixture<VersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CoreModule.forTest(),
        MarketModule.forRoot(),
        MainViewModule,
        HttpClientModule,
        RpcModule.forTest()
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
