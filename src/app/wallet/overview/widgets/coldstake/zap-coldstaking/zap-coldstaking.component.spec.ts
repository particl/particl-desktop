import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef} from '@angular/material';

import { SharedModule } from '../../../../shared/shared.module';
import { CoreModule } from '../../../../../core/core.module';
import { CoreUiModule } from '../../../../../core-ui/core-ui.module';

import { ZapColdstakingComponent } from './zap-coldstaking.component';
import { ModalsService } from '../../../../../modals/modals.service';

describe('ZapColdstakingComponent', () => {
  let component: ZapColdstakingComponent;
  let fixture: ComponentFixture<ZapColdstakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      declarations: [ ZapColdstakingComponent ],
      providers: [{ provide: MatDialogRef}, ModalsService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZapColdstakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
