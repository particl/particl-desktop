import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { CoreUiModule } from '../../core-ui.module';
import { SharedModule } from '../../../wallet/shared/shared.module';

import { BlockSyncBarComponent } from './block-sync-bar.component';

describe('BlockSyncBarComponent', () => {
  let component: BlockSyncBarComponent;
  let fixture: ComponentFixture<BlockSyncBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockSyncBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update progress', () => {
    component.updateProgress(5);
    expect(component.syncPercentage).toEqual(5);
  });
});
