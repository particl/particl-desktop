export class Command {
  constructor(private typeValue: number, private textContent: string, private timeValue: string, private code?: number) { }

  get text() {
    return this.textContent;
  }

  get type() {
    return this.typeValue;
  }

  get time() {
    return this.timeValue;
  }
}
