import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { ProposalOptionResult } from 'app/wallet/proposals/models/proposal-option-result.model';
import { GraphOption } from 'app/wallet/proposals/models/proposal-result-graph-option.model';

export class ProposalResult {
    id: number;
    Proposal: Proposal
    ProposalOptionResults: ProposalOptionResult[];
    block: number
    createdAt: Date;
    proposalId: number;
    updatedAt: Date;
    private graphOptions: GraphOption[] = [];
    private totalVoteCounts: number = 0;

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
        this.ProposalOptionResults.map((optionResult: ProposalOptionResult) => {
            const option = new GraphOption({
                description: optionResult.ProposalOption.description,
                voters: optionResult.voters
            });
            this.addGraphOption(option);
        })
    }

    addGraphOption(option: GraphOption) {
        this.totalVoteCounts += option.voters;
        this.graphOptions.push(option)
    }

    get graphData(): GraphOption[] {
        return this.graphOptions;
    }

    get totalVotes(): number {
        return this.totalVoteCounts || 0;
    }
}
