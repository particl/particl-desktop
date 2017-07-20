import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap';

import { ModalsComponent } from './modals.component';
import { ModalsModule } from './modals.module';


describe('ModalsComponent', () => {
  let component: ModalsComponent;
  let fixture: ComponentFixture<ModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ModalsModule, ModalModule.forRoot()]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should update progress', () => {
    //component.updateProgress()
    expect(component.syncPercentage).toBe(0);
  });
/*
  it('should open', () => {
    //component.open(any: message);
    expect(component.syncString).toBeDefined();
  });

  it('should close', () => {
    component.close();
    expect(component.close).toBeTruthy();
  });
*/
  it('should get closeOnEscape', () => {
    expect(component.closeOnEscape).toBe(true);
  });

  it('should get hasScrollY', () => {
    expect(component.hasScrollY).toBe(false);
  });

  it('should get modal', () => {
    expect(component.modal).toBe(undefined);
  });
/*
  it('should get modalContainer', () => {
    expect(component.modalContainer).toBeDefined();
  });
  */
});
