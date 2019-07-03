import { Component, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss']
})
export class PageIntroComponent implements AfterViewInit {

  @Input() canHideContent: boolean = true;
  @ViewChild('pageContent') pageContentRef: ElementRef;
  @ViewChild('pageInfo') pageInfoRef: ElementRef;
  private viewKey: string;
  public hasPageContent: boolean = false;
  public hasPageInfo: boolean = true;
  public showPageContent: boolean = false;

  constructor(
    private _router: Router,
    private cdRef:ChangeDetectorRef
  ) {
    this.viewKey = this._router.url.replace(/\//g, '-').substring(1);
    this.showPageContent = this.canHideContent ? this.getPageContentState() : true;
  }

  ngAfterViewInit() {
    this.hasPageContent = this.pageContentRef.nativeElement.textContent.trim() !== '' && this.canHideContent;
    this.cdRef.detectChanges();
  }

  toggleInfo() {
    this.showPageContent = !this.showPageContent;
    this.setPageContentState();
  }

  private getPageContentState() {
    const pageInfoState = JSON.parse(localStorage.getItem('pageInfoState')) || {};
    return pageInfoState[this.viewKey] === undefined ? true : pageInfoState[this.viewKey];
  }

  private setPageContentState() {
    const pageInfoState = JSON.parse(localStorage.getItem('pageInfoState')) || {};
    pageInfoState[this.viewKey] = this.showPageContent;
    localStorage.setItem('pageInfoState', JSON.stringify(pageInfoState));
  }
}
