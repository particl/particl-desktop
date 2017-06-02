import { Component, OnInit, Input, HostBinding } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

import { SidebarService } from '../sidebar.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  private _isOpen: boolean = false;
  private _isPinned: boolean = false;
  private _isDocked: boolean = false;

  @Input()
  position: string;
  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value;
  }
  @Input()
  set isPinned(value: boolean) {
    this._isPinned = value;
  }
  @Input()
  set isDocked(value: boolean) {
    this._isDocked = value;
  }

  get isOpen(): boolean {
    return this._sidebarService.isOpen(this.position);
  }
  get isPinned(): boolean {
    return this._sidebarService.isPinned(this.position);
  }
  get isDocked(): boolean {
    return this._sidebarService.isDocked(this.position);
  }

  @HostBinding('class.open')
  get openClass() {
    switch(this.position) {
      case 'left':
      case 'right':
        return this._sidebarService.isOpen(this.position);
      default:
        return false;
    }
  }
  @HostBinding('class.docked')
  get dockedClass() {
    switch(this.position) {
      case 'left':
      case 'right':
      case 'top':
      case 'bottom':
        return this._sidebarService.isDocked(this.position) && !this._sidebarService.isOpen(this.position);
      default:
        return false;
    }
  }

  @HostBinding('class.docked-left')
  get dockedLeftClass() {
    switch(this.position) {
      case 'top':
      case 'bottom':
      case 'center':
        return this._sidebarService.isDocked('left');
      default:
        return false;
    }
  }
  @HostBinding('class.docked-right')
  get dockedRightClass() {
    switch(this.position) {
      case 'top':
      case 'bottom':
      case 'center':
        return this._sidebarService.isDocked('right');
      default:
        return false;
    }
  }
  @HostBinding('class.docked-top')
  get dockedTopClass() {
    switch(this.position) {
      case 'center':
        return this._sidebarService.isDocked('top');
      default:
        return false;
    }
  }
  @HostBinding('class.docked-bottom')
  get dockedBottomClass() {
    switch(this.position) {
      case 'center':
        return this._sidebarService.isDocked('bottom');
      default:
        return false;
    }
  }

  @HostBinding('class.pinned-left')
  get pinnedLeftClass() {
    switch(this.position) {
      case 'top':
      case 'bottom':
        return this._sidebarService.isOpen('left');
      case 'center':
        return this._sidebarService.isPinned('left') && this._sidebarService.isOpen('left');
      default:
        return false;
    }
  }
  @HostBinding('class.pinned-right')
  get pinnedRightClass() {
    switch(this.position) {
      case 'top':
      case 'bottom':
        return this._sidebarService.isOpen('right');
      case 'center':
        return this._sidebarService.isPinned('right') && this._sidebarService.isOpen('right');
      default:
        return false;
    }
  }

  constructor(
    private _sidebarService: SidebarService
  ) {

    // Close both sidebars on 'window:resize' if the screen is too small
    Observable
      .fromEvent(window, 'resize')
      .debounceTime(100)
      .filter(() => window.innerWidth < 768)
      .filter(() => this._sidebarService.isOpen('left'))
      .filter(() => this._sidebarService.isOpen('right'))
      .subscribe(() => {
        this._sidebarService.toggleOpen('left', false);
        this._sidebarService.toggleOpen('right', false);
      });

    // Close the opposite sidebar on 'toggleOpen' if the screen is too small
    this._sidebarService.isOpen$
      .filter(obj => obj.isOpen)
      .filter(obj => window.innerWidth < 768)
      .map(obj => obj.position === 'left' ? 'right' : 'left')
      .filter(position => this._sidebarService.isOpen(position))
      .subscribe(position => this._sidebarService.toggleOpen(position));
  }

  ngOnInit(): void {
    this._sidebarService.toggleOpen(this.position, this._isOpen);
    this._sidebarService.toggleDocked(this.position, this._isDocked);
    this._sidebarService.togglePinned(this.position, this._isPinned);
  }

  toggleOpen(open?: boolean): void {
    this._sidebarService.toggleOpen(this.position, open);
  }
  toggleDocked(dock?: boolean): void {
    this._sidebarService.toggleDocked(this.position, dock);
  }
  togglePinned(pin?: boolean): void {
    this._sidebarService.togglePinned(this.position, pin);
  }

}
