import { PageEvent } from './page-event-model';
import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})

export class PaginatorComponent implements OnInit {

  pageIndex: number = 0;
  @Input() length: number = 0;
  @Input() pageSize: number = 0;
  @Input() pageSizeOptions: number[] = [];
  @Output() page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @HostBinding('class.mat-paginator')

  public _intl: any = {
    itemsPerPageLabel: 'Items per page:',
    nextPageLabel: 'Next page',
    previousPageLabel: 'Previous page',
    firstPageLable: 'Fist Page',
    lastPageLable: 'Last Page'
  };

  constructor() { }

  ngOnInit() {}

  /** Advances to the next page if it exists. */
  nextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }
    this.pageIndex++;
    this._emitPageEvent();
  }

  /** Move back to the previous page if it exists. */
  previousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }
    this.pageIndex--;
    this._emitPageEvent();
  }

  /** Move back to the first page. */
  firstPage(): void {
    this.pageIndex = 0;
    this._emitPageEvent();
  }

  /** go to the last page if it exists. */
  lastPage(): void {
    this.pageIndex = Math.ceil(this.length / this.pageSize) - 1;
    this._emitPageEvent();
  }

  /**
   * Whether there is a previous page.
   * @return {?}
   */
  hasPreviousPage() {
    return this.pageIndex >= 1 && this.pageSize !== 0;
  };

  /**
   * Whether there is a next page.
   * @return {?}
   */
  hasNextPage() {
    const numberOfPages = Math.ceil(this.length / this.pageSize) - 1;
    return this.pageIndex < numberOfPages && this.pageSize !== 0;
  };

  getRangeLabel(page: number, pageSize: number, length: number) {
    if (length === 0 || pageSize === 0) {
      return '0 of ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length,
    // do not try and fix the end index to the end.
    const endIndex = startIndex < length
      ? Math.min(startIndex + pageSize, length)
      : startIndex + pageSize;
    return startIndex + 1 + ' - ' + endIndex + ' of ' + length;
  }

  /**
   * Changes the page size so that the first item displayed on the page will still be
   * displayed using the new page size.
   *
   * For example, if the page size is 10 and on the second page (items indexed 10-19)
   * then switching so that the page size is 5 will set the third page
   * as the current page so that the 10th item will still be displayed.
   * @param {?} pageSize
   * @return {?}
   */
  _changePageSize(pageSize: number): void {
    // Current page needs to be updated to reflect the new page size.
    // Navigate to the page containing the previous page's first item.
    const startIndex = this.pageIndex * this.pageSize;
    this.pageIndex = Math.floor(startIndex / pageSize) || 0;
    this.pageSize = pageSize;
    this._emitPageEvent();
  }

  _emitPageEvent(): void {
    this.page.next({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length
    });
  }

  resetPagination(pageIndex: number): void {
    this.pageIndex = pageIndex
  }
}
