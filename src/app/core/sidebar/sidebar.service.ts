import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SidebarService {

  private _leftIsOpenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _rightIsOpenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _leftIsPinnedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _rightIsPinnedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _leftIsDockedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _rightIsDockedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _topIsDockedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _bottomIsDockedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isOpen$: Observable<any> = Observable.merge(
    this._leftIsOpenSubject.asObservable()
      .map(isOpen => ({position: 'left', isOpen})),
    this._rightIsOpenSubject.asObservable()
      .map(isOpen => ({position: 'right', isOpen}))
  );

  isPinned$: Observable<Object> = Observable.merge(
    this._leftIsPinnedSubject.asObservable()
      .map(isPinned => ({position: 'left', isPinned})),
    this._rightIsPinnedSubject.asObservable()
      .map(isPinned => ({position: 'right', isPinned}))
  );

  isDocked$: Observable<Object> = Observable.merge(
    this._leftIsDockedSubject.asObservable()
      .map(isDocked => ({position: 'left', isDocked})),
    this._rightIsDockedSubject.asObservable()
      .map(isDocked => ({position: 'right', isDocked})),
    this._topIsDockedSubject.asObservable()
      .map(isDocked => ({position: 'top', isDocked})),
    this._bottomIsDockedSubject.asObservable()
      .map(isDocked => ({position: 'bottom', isDocked}))
  );

  constructor() {
  }

  isOpen(position: string): boolean {
    if (['left', 'right'].indexOf(position) != -1)
      return this[`_${position}IsOpenSubject`].value;
    return false;
  }

  isPinned(position: string): boolean {
    if (['left', 'right'].indexOf(position) != -1)
      return this[`_${position}IsPinnedSubject`].value;
    return false;
  }

  isDocked(position: string): boolean {
    if (['left', 'right', 'top', 'bottom'].indexOf(position) != -1)
      return this[`_${position}IsDockedSubject`].value;
    return false;
  }

  toggleOpen(position: string, open?: boolean): void {
    if (['left', 'right'].indexOf(position) != -1)
      this[`_${position}IsOpenSubject`].next(String(open) !== 'undefined' ? open : !this[`_${position}IsOpenSubject`].value);
  }

  togglePinned(position: string, pin?: boolean): void {
    if (['left', 'right'].indexOf(position) != -1)
      this[`_${position}IsPinnedSubject`].next(String(pin) !== 'undefined' ? pin : !this[`_${position}IsPinnedSubject`].value);
  }

  toggleDocked(position: string, dock?: boolean): void {
    if (['left', 'right', 'top', 'bottom'].indexOf(position) != -1)
      this[`_${position}IsDockedSubject`].next(String(dock) !== 'undefined' ? dock : !this[`_${position}IsDockedSubject`].value);
  }

}
