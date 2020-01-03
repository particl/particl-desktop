export class Contact {

  constructor(private label: string, private address: string) { }

  public getLabel() {
    return this.label;
  }

  public getAddress() {
    return this.address;
  }
}
