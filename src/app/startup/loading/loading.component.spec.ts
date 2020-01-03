import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CoreModule } from '../core/core.module';
import { CoreUiModule } from '../core-ui/core-ui.module';
import { MultiwalletModule } from '../multiwallet/multiwallet.module';

import { LoadingComponent } from './loading.component';
import { SettingsModule } from 'app/settings/settings.module';


describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingComponent ],
      imports: [
        RouterTestingModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        MultiwalletModule.forTest(),
        SettingsModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
