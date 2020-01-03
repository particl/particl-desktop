import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-import-custom-ui-woocommerce',
  templateUrl: './woocommerce.component.html',
  styleUrls: ['./woocommerce.component.scss']
})
export class ImportCustomUiWoocommerceComponent {
  @Input() import: any;
  @Output() clear: EventEmitter<any> = new EventEmitter<any>();

  emitClear() {
    this.clear.emit();
  }

  numericValidator(event: any) {
    const pasted = String(event.clipboardData ? event.clipboardData.getData('text') : '' );
    const key = String(event.key || '');

    const value = `${pasted}${key}${String(event.target.value)}`;
    let valid = true;
    let sepFound = false;
    for (let ii = 0; ii < value.length; ii++) {
      if (value.charAt(ii) === '.') {
        if (sepFound) {
          valid = false;
          break;
        }
        sepFound = true;
        continue;
      }
      const charCode = value.charCodeAt(ii);
      if ( (charCode < 48) || (charCode > 57)) {
        valid = false;
        break;
      }
    }
    if (!valid) {
      return false;
    }
  }
}
