import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { OverlayConfig, OverlayRef, Overlay } from '@angular/cdk/overlay';
import { CdkPortal } from '@angular/cdk/portal';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

import { Observable, Subject, Subscription, merge } from 'rxjs';
import { takeUntil, take, mapTo } from 'rxjs/operators';

import { InputItem, ItemNode, ItemFlatNode } from './tree-select.models';


enum TextContent {
  MULTIPLE_SELECTED = '(${count} selected)'
}


@Component({
  selector: 'tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss']
})
export class TreeSelectComponent implements OnInit, OnDestroy {

  @Input() data$: Observable<InputItem[]>;
  @Input() singleSelection: boolean = false;
  @Input() isParentNodesSelectable: boolean = true;
  @Input() placeholderLabel: string = '';
  @Input() initialSelection: number[] = [];
  @Output() onClosed: EventEmitter<number[]> = new EventEmitter();

  selectionLabel: string = '';
  treeControl: FlatTreeControl<ItemFlatNode>;
  dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;
  checklistSelection: SelectionModel<ItemFlatNode>;


  private destroy$: Subject<void> = new Subject();
  private close$: Subscription;
  private treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;


  @ViewChild(CdkPortal, {static: true}) private portal: CdkPortal;
  @ViewChild('itemListLabel', {static: true}) private itemListLabel: ElementRef;

  private overlayElement: OverlayRef;

  constructor(
    private _overlay: Overlay
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }


  ngOnInit() {
    this.checklistSelection = new SelectionModel<ItemFlatNode>(!this.singleSelection /* multiple */);
    this.selectionLabel = this.placeholderLabel;

    let defaultItemsSelected: number[] = JSON.parse(JSON.stringify(this.initialSelection));

    if (this.data$ !== undefined) {
      this.data$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(data => {
        this.dataSource.data = this.buildNodeTree(data, 0);

        if (defaultItemsSelected.length > 0) {
          if (this.singleSelection && (defaultItemsSelected.length !== 1)) {
            // ensure only a single item is set if singleSelection is enabled
            defaultItemsSelected = [defaultItemsSelected[0]];
          }
          this.treeControl.dataNodes.filter(
            flatNode => defaultItemsSelected.includes(flatNode.id)
          ).forEach(
            node => node.expandable ? this.itemSelectionToggle(node) : this.leafItemSelectionToggle(node)
          );

          defaultItemsSelected = [];

          // setting of the correct labels, etc
          this.cleanupPanel(false);
        }
      });
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.close$ && !this.close$.closed) {
      this.close$.unsubscribe();
    }
  }


  showPanel() {
    if (this.overlayElement === undefined) {
      const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(this.itemListLabel)
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

      const overlayConfig = new OverlayConfig({
        positionStrategy: positionStrategy,
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop'
      });

      this.overlayElement = this._overlay.create(overlayConfig);
    }

    this.overlayElement.attach(this.portal);

    let closeEvent: Observable<boolean>;
    if (this.singleSelection) {
      closeEvent = merge(
        this.checklistSelection.changed.pipe(mapTo(true), take(1), takeUntil(this.destroy$)),
        this.overlayElement.backdropClick().pipe(mapTo(false), take(1), takeUntil(this.destroy$))
      );
    } else {
      closeEvent = this.overlayElement.backdropClick().pipe(mapTo(true));
    }

    this.close$ = closeEvent.pipe(
      take(1)
    ).subscribe((doEmit: boolean) => this.cleanupPanel(doEmit));
  }


  hasChild = (_: number, _nodeData: ItemFlatNode) => _nodeData.expandable;


  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: ItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the item selection. Select/deselect all the descendants node */
  itemSelectionToggle(node: ItemFlatNode): void {
    if (node.expandable && !this.isParentNodesSelectable) {
      // prevent parent nodes from being selected
      return;
    }

    this.checklistSelection.toggle(node);

    if (!this.singleSelection) {
      const descendants = this.treeControl.getDescendants(node);
      this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);

      // Force update for the parent
      descendants.every(child =>
        this.checklistSelection.isSelected(child)
      );
    }
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf item selection. Check all the parents to see if they changed */
  leafItemSelectionToggle(node: ItemFlatNode): void {
    if (node.expandable && !this.isParentNodesSelectable) {
      // prevent parent nodes from being selected
      return;
    }
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }


  private cleanupPanel(emitResult: boolean = true) {
    if (this.overlayElement) {
      this.overlayElement.detach();
    }

    const selected = this.checklistSelection.selected;
    switch (true) {
      case selected.length === 1:
        this.selectionLabel = selected[0].item;
        break;
      case selected.length > 1:
        this.selectionLabel = TextContent.MULTIPLE_SELECTED.replace('${count}', `${selected.length}`);
        break;
      default:
        this.selectionLabel = this.placeholderLabel;
    }

    if (emitResult) {
      this.onClosed.emit(selected.map((flatNode) => flatNode.id));
    }
  }


  private buildNodeTree(items: InputItem[], level: number): ItemNode[] {
    return items.reduce<ItemNode[]>((accumulator: ItemNode[], item: InputItem) => {
      const node = new ItemNode();
      node.id = item.id;
      node.item = item.name;
      const children = item.children;

      if ((Object.prototype.toString.call(children) === '[object Array]') && (children.length > 0)) {
        node.children = this.buildNodeTree(children, level + 1);
      }

      return accumulator.concat(node);
    }, []);
  }


  private getLevel = (node: ItemFlatNode) => node.level;

  private isExpandable = (node: ItemFlatNode) => node.expandable;

  private getChildren = (node: ItemNode): ItemNode[] => node.children;


  /**
   * Transformer to convert nested node to flat node.
   */
  private transformer = (node: ItemNode, level: number) => {
    const flatNode = new ItemFlatNode();
    flatNode.id = node.id;
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    return flatNode;
  }


  /* Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(node: ItemFlatNode): void {
    let parent: ItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  private checkRootNodeSelection(node: ItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  private getParentNode(node: ItemFlatNode): ItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
}
