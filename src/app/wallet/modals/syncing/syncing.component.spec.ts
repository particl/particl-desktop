import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncingComponent } from './syncing.component';
import { MdIconModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';

import { CoreModule } from '../../../core/core.module';

describe('SyncingComponent', () => {
  let component: SyncingComponent;
  let fixture: ComponentFixture<SyncingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MdIconModule,
        CoreModule.forRoot()
       ],
      declarations: [ SyncingComponent ]
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
