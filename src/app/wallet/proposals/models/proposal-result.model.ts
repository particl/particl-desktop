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
    graphData: GraphOption[] = [];
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
            this.addGraphOption(optionResult);
        })
    }

    addGraphOption(optionResult: ProposalOptionResult) {
        this.totalVoteCounts += optionResult.voters;
        this.graphData.push(new GraphOption({
            option: optionResult.ProposalOption.description,
            voters: optionResult.voters
        }))
    }

    get graphInformation(): any {
        return this.graphData;
    }

    get totalVotes(): number {
        return this.totalVoteCounts;
    }
}
