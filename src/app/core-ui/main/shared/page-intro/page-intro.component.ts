import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss']
})
export class PageIntroComponent implements AfterViewInit {

  @Input() canHideContent: boolean = false;
  @ViewChild('pageContent') pageContentRef: ElementRef;
  @ViewChild('pageInfo') pageInfoRef: ElementRef;
  private viewKey: string;
  public hasPageContent: boolean = false;
  public hasPageInfo: boolean = true;
  public showPageContent: boolean = false;

  constructor(private _router: Router) {
    this.viewKey = this._router.url.replace(/\//g, '-').substring(1);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.hasPageContent = this.pageContentRef.nativeElement.textContent.trim() !== '' && this.canHideContent;
      this.showPageContent = this.canHideContent ? this.getPageContentState() : true;

      this.checkPageInfo();
    }, 0);
  }

  toggleInfo() {
    this.showPageContent = !this.showPageContent;
    this.checkPageInfo();
    this.setPageContentState();
  }

  private checkPageInfo() {
    if (this.showPageContent) {
      this.hasPageInfo = this.pageInfoRef.nativeElement.textContent.trim() !== '';
    }
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
