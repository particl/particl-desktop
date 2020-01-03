import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { OverlayConfig, OverlayRef, Overlay } from '@angular/cdk/overlay';
import { TemplatePortalDirective } from '@angular/cdk/portal';
import { ItemFlatNode } from '../tree-with-search/model/item-flat-node';
import { Category } from 'app/core/market/api/category/category.model';

@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.scss']
})
export class CategoryTreeComponent {
  overlayRef: OverlayRef;
  @ViewChild('categoryInput') public categoryInput: ElementRef;
  @ViewChild('parent') parent: ElementRef;
  @ViewChild(TemplatePortalDirective)
  public contentTemplate: TemplatePortalDirective;

  @Input() options: any[];
  @Input() selected: ItemFlatNode | Category;
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  constructor(public overlay: Overlay) { }

  onChangeCall(info: any): void {
    this.selected = info
    this.onChange.emit(info);
    this.hide()
  }

  getOverlayConfig(): any {
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.categoryInput)
      .withPush(false)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }, {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
      }]);

    return new OverlayConfig({
      positionStrategy: positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });
  }

  show() {

    /**
     * for closing the other open popup modals.
     * need to refactor it later in future.
     */
    this.parent['_elementRef'].nativeElement.click()

    this.overlayRef = this.overlay.create(this.getOverlayConfig());
    this.overlayRef.attach(this.contentTemplate);
    this.overlayRef.backdropClick().subscribe(() => {
      this.hide()
    });
  }

  public hide() {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
