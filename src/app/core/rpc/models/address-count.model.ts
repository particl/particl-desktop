
export class AddressCount {

  total: number;
  num_receive: number;
  num_send: number;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
