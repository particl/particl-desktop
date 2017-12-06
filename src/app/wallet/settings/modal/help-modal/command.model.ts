export class Command {

  constructor(private type: number, private text: string, private time: string, private code?: number) { }

  public getType() {
    return this.type;
  }

  public getText() {
    return this.text;
  }

  public getCode() {
    return this.code;
  }

  public logTime() {
    return this.time;
  }
}
