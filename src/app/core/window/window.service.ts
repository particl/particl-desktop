import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {

  private _window: Window;

  constructor() {
    this._window = window;
  }

  get width(): number {
    return this._window.innerWidth;
  }
  get height(): number {
    return this._window.innerHeight;
  }

  get isXS(): boolean {
    return this.width < 768;
  }
  get isSM(): boolean {
    return this.width > 767 && this.width < 992;
  }
  get isMD(): boolean {
    return this.width > 991 && this.width < 1200;
  }
  get isLG(): boolean {
    return this.width > 1199;
  }

}
