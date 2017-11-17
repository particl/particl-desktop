import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../../wallet/wallet.module';
import { RpcModule } from '../../../core/rpc/rpc.module';

import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        RpcModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter by category', () => {
    component.filterByCategory('all');
    expect(component.category).toBe('all');
  });
});
