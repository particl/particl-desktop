export class Command {

  private isTextObject: boolean = false;

  constructor(private typeValue: number, private textContent: string, private timeValue: string, private codeValue?: number) {
    this.isTextObject = typeof textContent === 'object';
  }

  get text(): string {
    return this.textContent;
  }

  get type(): number {
    return this.typeValue;
  }

  get time(): string {
    return this.timeValue;
  }

  get code(): number | undefined {
    return this.codeValue;
  }

  get isJson(): boolean {
    return this.isTextObject;
  }


}
