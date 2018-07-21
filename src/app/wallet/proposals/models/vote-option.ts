export class VoteOption {
  public optionId: number;
  public description: string;

  constructor(obj: any) {
    this.optionId = obj.optionId;
    this.description = obj.description;
  }
}
