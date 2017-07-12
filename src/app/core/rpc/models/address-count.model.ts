
export class AddressCount {

  total: number;
  num_receive: number;
  num_send: number;

  constructor( total: number, num_receive: number, num_send: number) {
    if( num_receive + num_send !== total){
      throw new RangeError('Invalid total value.');
    }

    this.total = total;
    this.num_receive = num_receive;
    this.num_send = num_send;
  }
}
