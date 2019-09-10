import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CategoryService } from 'app/core/market/api/category/category.service';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-import-custom-ui-csv',
  templateUrl: './csv.component.html',
  styleUrls: ['./csv.component.scss']
})
export class ImportCustomUiCsvComponent {
  @Input() import: any;
  @Output() clear: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private category: CategoryService
  ) {}

  emitClear() {
    this.clear.emit();
  }

  generateCategories() {

    this.category.list().pipe(
      take(1)
    ).subscribe(rootCategory => {
      let csv = 'Parent Category (Not selectable), Child Category\n';
      for (const parentCategory of rootCategory.subCategoryList) {
        for (const childCategory of parentCategory.subCategoryList) {
          csv += `${parentCategory.name},${childCategory.name}\n`;
        }
      }
      const csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
      const csvURL = window.URL.createObjectURL(csvData);
      const tempLink = document.createElement('a');
      tempLink.href = csvURL;
      tempLink.setAttribute('download', 'categories.csv');
      tempLink.click();
    });
  }
}
