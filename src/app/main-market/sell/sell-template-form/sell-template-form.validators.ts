import { ValidatorFn, AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';


export function amountValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (
      !((+control.value > 0) || (+control.value === 0)) ||
      ((`${control.value}`.split('.')[1] || '').length > 8)
    ) {
        return { 'amount': true };
    }
    return null;
  };
}


export const totalValueValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
  const total = +group.get('priceShipLocal').value + +group.get('priceShipIntl').value + +group.get('basePrice').value;

  return total <= 1e-06 ? { 'totalValue': true } : null;
};


export const categorySelectedValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
  return +group.get('selectedMarket').value > 0 ? (+group.get('selectedCategory').value > 0 ? null : {selectedCategory: true}) : null;
};


export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (typeof +control.value !== 'number' || parseInt(`${+control.value}`, 10) !== +control.value) {
        return { 'integer': true };
    }
    return null;
  };
}
