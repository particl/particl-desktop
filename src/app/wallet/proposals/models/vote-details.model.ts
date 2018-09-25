import { VoteOption } from 'app/wallet/proposals/models/vote-option.model';

export class VoteDetails {
  ProposalOption: VoteOption
  createdAt: Date;
  id: number;
  proposalOptionId: number;
  updatedAt: Date;
  voter: string;
  weight: number;

  constructor(object: any) {
    this.ProposalOption = new VoteOption(object.ProposalOption);
    this.createdAt = object.createdAt;
    this.id = object.id;
    this.proposalOptionId = object.ProposalOption.id;
    this.updatedAt = object.updatedAt;
    this.voter = object.voter;
    this.weight = object.weight;
  }

  get isReported(): boolean {
    return this.ProposalOption.description === 'REMOVE';
  }
}

