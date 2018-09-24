import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';

import { SyncingComponent } from './syncing.component';

describe('SyncingComponent', () => {
  let component: SyncingComponent;
  let fixture: ComponentFixture<SyncingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
       ],
       providers: [ { provide: MatDialogRef } ],
       declarations: [SyncingComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should getRemainder', () => {
    component.getRemainder();
    expect(component.getRemainder).tobe();
  });
*/
  it('should get increasePerMinute', () => {
    expect(component.increasePerMinute).toBe(undefined);
  });

  it('should get lastBlockTime', () => {
    expect(component.lastBlockTime).toBe(undefined);
  });

  it('should get remainingBlocks', () => {
    expect(component.remainder).toBe(undefined);
  });
});
