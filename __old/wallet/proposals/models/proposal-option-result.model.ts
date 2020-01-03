import { VoteOption } from 'app/wallet/proposals/models/vote-option.model';

export class ProposalOptionResult {
    ProposalOption: VoteOption;
    createdAt: Date;
    proposalOptionId: number;
    proposalResultId: number;
    updatedAt: Date;
    voters: number;
    weight: number;
    constructor(object: any) {
        this.ProposalOption = new VoteOption(object.ProposalOption);
        this.createdAt = object.createdAt;
        this.proposalOptionId = object.proposalOptionId;
        this.proposalResultId = object.proposalResultId;
        this.updatedAt = object.updatedAt;
        this.voters = object.voters;
        this.weight = object.weight;
    }
}
