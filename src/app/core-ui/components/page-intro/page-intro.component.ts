import { Component, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss']
})
export class PageIntroComponent implements OnInit, AfterViewInit {

  @Input() childPageAlias: string = '';
  @Input() canHideContent: boolean = true;

  @ViewChild('pageContent', { static: false }) pageContentRef: ElementRef;
  private viewKey: string;
  public hasPageContent: boolean = false;
  public showPageContent: boolean = false;

  constructor(
    private _router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.canHideContent) {
      this.viewKey = this._router.url.replace(/\//g, '-').substring(1) + (this.childPageAlias ? '-' + this.childPageAlias : '');
      this.showPageContent = this.getPageContentState();
    } else {
      this.showPageContent = true;
    }
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
