export class Contact {
  private label: string;
  private address: string;

  constructor(label: string, address: string) { }

  public getLabel() {
    return this.label;
  }

  public getAddress() {
    return this.address;
  }
}
