export class VoteOption {
  public optionId: number;
  public description: string;
  createdAt: Date;
  hash: string;
  id: number;
  proposalId: string;
  updatedAt: Date;

  constructor(object: any) {
    this.optionId = object.optionId;
    this.description = object.description;
    this.createdAt = object.createdAt;
    this.hash = object.hash;
    this.id = object.id;
    this.proposalId = object.proposalId;
    this.updatedAt = object.updatedAt;
  }
}
