import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { ProposalOptionResult } from 'app/wallet/proposals/models/proposal-option-result.model';

export class ProposalResult {
    id: number;
    Proposal: Proposal
    ProposalOptionResults: ProposalOptionResult[];
    block: number
    createdAt: Date;
    proposalId: number;
    updatedAt: Date;
    graphData: any[] = [];
    totalVoteCounts: number = 0;

    constructor(object: any) {
        this.id = object.id;
        this.Proposal = object.Proposal;
        this.ProposalOptionResults = object.ProposalOptionResults.map((v) => new ProposalOptionResult(v));
        this.block = object.block;
        this.createdAt = object.createdAt;
        this.proposalId = object.proposalId;
        this.updatedAt = object.updatedAt;
        this.setGraphInformation()
    }

    setGraphInformation() {
        this.ProposalOptionResults.map((optionResult) => {
            this.totalVoteCounts += optionResult.voters;
            this.graphData.push({
                option: optionResult.ProposalOption.description,
                voters: optionResult.voters
            })
        })
    }

    get graphInformation(): any {
        return this.graphData;
    }

    get totalVotes(): number {
        return this.totalVoteCounts;
    }
}
