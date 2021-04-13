import { Component, OnInit, Inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Subject, BehaviorSubject, merge, of, Observable } from 'rxjs';
import { tap, takeUntil, finalize, catchError, mapTo } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { DataService } from '../../../services/data/data.service';
import { MarketManagementService } from '../../management.service';
import { isBasicObjectType } from '../../../shared/utils';
import { CategoryFlatNode, CategoryNode } from './category-editor.models';
import { GenericModalInfo } from '../joined-markets.models';
import { CategoryItem } from '../../../services/data/data.models';


enum TextContent {
  CATEGORY_ADD_ERROR = 'Cannot add that category',
  CATEGORY_REMOVE_ERROR = 'Failed to remove the category'
}


@Component({
  templateUrl: './category-editor-modal.component.html',
  styleUrls: ['./category-editor-modal.component.scss']
})
export class CategoryEditorModalComponent implements OnInit, OnDestroy {

  isEditable: boolean = false;

  treeControl: FlatTreeControl<CategoryFlatNode>;
  dataSource: MatTreeFlatDataSource<CategoryNode, CategoryFlatNode>;

  // This is the category nesting level (supported by the lookup to retrieve categories) less 1
  //  Reason for one less than supported is because the supported amount includes the root category, which cannot actually be modified
  readonly MAX_DEPTH: number = 4;
  readonly BASE_LEVEL: number = 0;

  private marketId: number = 0;
  private rootCategoryId: number = 0;
  private destroy$: Subject<void> = new Subject();
  private categoriesList: BehaviorSubject<CategoryItem[]> = new BehaviorSubject([]);

  @ViewChild('rootCategoryName', {static: false}) private rootCategoryInput: ElementRef;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericModalInfo,
    private _dataService: DataService,
    private _manageService: MarketManagementService,
    private _snackbar: SnackbarService
  ) {

    if ( isBasicObjectType(this.data) && isBasicObjectType(this.data.market) ) {
      this.marketId = +this.data.market.id > 0 ? +this.data.market.id : this.marketId;
    }

    const treeFlattener: MatTreeFlattener<CategoryNode, CategoryFlatNode> = new MatTreeFlattener(
      this.transformer, this.getLevel, this.isExpandable, this.getChildren
    );
    this.treeControl = new FlatTreeControl<CategoryFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
  }

  ngOnInit() {

    if (this.marketId === 0) {
      return;
    }

    const categoryChange$ = this.categoriesList.asObservable().pipe(
      tap((data) => {
        this.updateNodes(this.buildNodeTree(data, this.BASE_LEVEL));
      }),
      takeUntil(this.destroy$)
    );

    const init$ = this._dataService.loadCategories(this.marketId).pipe(
      tap((categories) => {
        if (+categories.rootId > 0) {
          this.rootCategoryId = +categories.rootId;
        }
        this.categoriesList.next(categories.categories);
        this.isEditable = true;
      })
    );

    merge(
      categoryChange$,
      init$
    ).subscribe();
  }


  ngOnDestroy() {
    this.categoriesList.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  createRootCategory(categoryName: string): void {
    if (!this.isEditable || (categoryName.length === 0)) {
      return;
    }

    this._createCategory(categoryName, this.rootCategoryId, this.BASE_LEVEL).subscribe(
      (newCategory) => {
        if (newCategory && this.rootCategoryInput && this.rootCategoryInput.nativeElement) {
          this.rootCategoryInput.nativeElement.value = '';
        }
      }
    );

  }


  createSubCategory(node: CategoryFlatNode, name: string): void {
    if (!this.isEditable || !isBasicObjectType(node)) {
      return;
    }

    const parentFlatNode = this.findParentFlatNode(node);
    if (!parentFlatNode || !(parentFlatNode.id > 0)) {
      return;
    }

    this._createCategory(name, parentFlatNode.id, node.level).subscribe();
  }


  insertSubCategory(parentFlatNode: CategoryFlatNode): void {
    if (!isBasicObjectType(parentFlatNode)) {
      return;
    }

    const editedNodes = this.clearEmptyInsertions();
    const parentNode = this.findNodeInTree(parentFlatNode.id, parentFlatNode.level, editedNodes);

    if (parentNode) {
      const newNode = new CategoryNode();
      newNode.id = 0;
      newNode.name = '';
      newNode.children = [];
      parentNode.children.push(newNode);
    }

    this.updateNodes(editedNodes);
  }


  cancelCategoryInsert(): void {
    this.updateNodes(this.clearEmptyInsertions());
  }


  removeCategory(node: CategoryFlatNode): void {
    if (!this.isEditable || (!isBasicObjectType(node) && !(+node.id > 0))) {
      return;
    }
    this._removeCategory(node.id, node.level).subscribe();
  }


  hasChild = (_: number, _nodeData: CategoryFlatNode): boolean => _nodeData.hasChildren;

  isNewItem = (_: number, _nodeData: CategoryFlatNode) => _nodeData.name === '';


  /**
   * Function to convert nested node to a flat node.
   */
  private transformer = (node: CategoryNode, level: number): CategoryFlatNode => {
    const flatNode = new CategoryFlatNode();
    flatNode.id = node.id;
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.hasChildren = Array.isArray(node.children) && (node.children.length > 0);
    return flatNode;
  }

  private getLevel = (node: CategoryFlatNode): number => node.level;

  private isExpandable = (node: CategoryFlatNode): boolean => true;

  private getChildren = (node: CategoryNode): CategoryNode[] => node.children;


  private buildNodeTree(items: CategoryItem[], level: number): CategoryNode[] {
    return items.reduce<CategoryNode[]>((accumulator: CategoryNode[], item: CategoryItem) => {
      const node = new CategoryNode();
      node.id = item.id;
      node.name = item.name;
      const children = item.children;

      if (Array.isArray(children) && (children.length > 0)) {
        node.children = this.buildNodeTree(children, level + 1);
      } else {
        node.children = [];
      }


      return accumulator.concat(node);
    }, []);
  }


  private _createCategory(name: string, parentId: number, nodeLevel: number): Observable<CategoryItem> {
    this.isEditable = false;

    return this._manageService.addCategoryToMarket(name, parentId, this.marketId).pipe(
      finalize(() => this.isEditable = true),
      tap((srcCategory) => {

        if (!(srcCategory.id > 0)) {
          return;
        }

        const categoryNodes = this.dataSource.data;

        if (parentId === this.rootCategoryId) {

          // insert new root category item

          const newCat = new CategoryNode();
          if (srcCategory) {
            newCat.id = srcCategory.id;
            newCat.name = srcCategory.name;
            newCat.children = [];
          }

          if (newCat.id > 0) {
            categoryNodes.push(newCat);
          }

        } else {

          // update new subcategory item with correct details
          const newCat = this.findNodeInTree(0, nodeLevel, categoryNodes);

          if (newCat) {
            newCat.id = srcCategory.id;
            newCat.name = srcCategory.name;
            newCat.children = [];
          }

        }
        this.updateNodes(categoryNodes);
      }),
      catchError(() => {
        this._snackbar.open(TextContent.CATEGORY_ADD_ERROR, 'warn');
        return of(null);
      })
    );
  }


  private _removeCategory(categoryId: number, nodeLevel: number): Observable<boolean> {
    this.isEditable = false;

    return this._manageService.removeCategory(categoryId).pipe(
      finalize(() => this.isEditable = true),
      tap(() => {
        const categoryNodes = this.dataSource.data;
        const siblings = this.findNodeAndSiblings(categoryId, nodeLevel, categoryNodes);
        const foundIdx = siblings.findIndex(n => n.id === categoryId);
        if (foundIdx > -1) {
          siblings.splice(foundIdx, 1);
        }
        this.updateNodes(categoryNodes);
      }),
      mapTo(true),
      catchError(() => {
        this._snackbar.open(TextContent.CATEGORY_REMOVE_ERROR, 'warn');
        return of(false);
      })
    );
  }


  private clearEmptyInsertions(nodes: CategoryNode[] = null): CategoryNode[] {
    const items = nodes === null ? this.dataSource.data : nodes;
    const resp: CategoryNode[] = [];
    for (let i = 0; i < items.length; i++) {
      if ((items[i].id === 0) || items[i].name === '') {
        continue;
      }

      if (items[i].children.length > 0) {
        items[i].children = this.clearEmptyInsertions(items[i].children);
      }
      resp.push(items[i]);
    }
    return resp;
  }


  private findNodeInTree(nodeId: number, atLevel: number, nodesList: CategoryNode[] = null): CategoryNode | null {
    if (atLevel < this.BASE_LEVEL) {
      return null;
    }

    const catNodes = nodesList ? nodesList : this.dataSource.data;
    let resp: CategoryNode = null;

    if (atLevel === this.BASE_LEVEL) {
      resp = catNodes.find(n => n.id === nodeId) || null;
    } else {
      for (let i = 0; i < catNodes.length; i++) {
        if (catNodes[i].children.length > 0) {
          resp = this.findNodeInTree(nodeId, atLevel - 1, catNodes[i].children);
        }
        if (resp) {
          break;
        }
      }
    }

    return resp;
  }


  private findNodeAndSiblings(nodeId: number, atLevel: number, nodesList: CategoryNode[] = null): CategoryNode[] {
    if (atLevel < this.BASE_LEVEL) {
      return [];
    }

    const catNodes = nodesList ? nodesList : this.dataSource.data;
    let resp: CategoryNode[] = [];

    if (atLevel === this.BASE_LEVEL) {
      resp = catNodes.findIndex(n => n.id === nodeId) > -1 ? catNodes : resp;
    } else {
      for (let i = 0; i < catNodes.length; i++) {
        if (catNodes[i].children.length > 0) {
          resp = this.findNodeAndSiblings(nodeId, atLevel - 1, catNodes[i].children);
        }
        if (resp.length > 0) {
          break;
        }
      }
    }

    return resp;
  }


  private findParentFlatNode(node: CategoryFlatNode): CategoryFlatNode | null {
    const currentLevel = node.level;

    if (currentLevel <= this.BASE_LEVEL) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }

    return null;
  }


  private updateNodes(nodeList: CategoryNode[]): void {
    this.dataSource.data = nodeList || [];
    // ensure the treecontrol remains expanded
    this.treeControl.expandAll();
  }

}
