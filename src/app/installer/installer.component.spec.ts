import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { InstallerModule } from 'app/installer/installer.module';

import { InstallerComponent } from './installer.component';

describe('InstallerComponent', () => {
  let component: InstallerComponent;
  let fixture: ComponentFixture<InstallerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        InstallerModule,
        RouterTestingModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
