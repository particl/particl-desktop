import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-import-custom-ui-csv',
  templateUrl: './csv.component.html',
  styleUrls: ['./csv.component.scss']
})
export class ImportCustomUiCsvComponent {
  @Input() import: any;
  @Output() clear: EventEmitter<any> = new EventEmitter<any>();

  emitClear() {
    this.clear.emit();
  }
}
