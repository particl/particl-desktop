import { ValidatorFn, AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';


export function amountValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (
      (typeof +control.value !== 'number') ||
      (!+control.value) ||
      (+control.value < 1e-8) ||
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
