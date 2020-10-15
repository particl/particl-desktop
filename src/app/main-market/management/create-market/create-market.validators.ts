import { ValidatorFn, AbstractControl } from '@angular/forms';
import { MarketType } from '../../shared/market.models';


export function MarketTypeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (
      (control.value === MarketType.STOREFRONT_ADMIN) ||
      (control.value === MarketType.MARKETPLACE)
    ) {
        return null;
    }
    return { 'marketType': true };
  };
}
