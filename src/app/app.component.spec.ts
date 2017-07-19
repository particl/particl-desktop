import { TestBed, async } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';

import { RouterTestingModule } from '@angular/router/testing';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

import { WindowService } from './core/window.service';

describe('AppComponent', () => {

let component: AppComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [
        RouterTestingModule,
        AppModule
      ],
      providers: [ {provide: APP_BASE_HREF, useValue: '/'} ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

/*
  it('should test firstTime running', () => {
    component._modalsService.firsttime();
    expect(component.firsttime).toBeTruthy();
  });

  it('should sync', () => {
    component.syncing();
    expect(component.syncing).toBeTruthy();
  });

  it('should unlock', () => {
    component.unlock();
    expect(component.unlock).toBeTruthy();
  });


  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('app works!');
  }));
  */
/*
  it('should get isCollapsed', () => {
    expect(component.isCollapsed).toBe(true);
  });

  it('should get isFixed', () => {
    expect(component.isFixed).toBe(false);
  });

  it('should get log', () => {
    expect(component.log).toBeDefined;
  });

  it('should get title', () => {
    expect(component.title).toBe('');
  });

  it('should get window', () => {
    expect(component.window).toBeDefined();
  });
  */
});
