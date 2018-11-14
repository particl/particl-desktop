import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { ProposalOptionResult } from 'app/wallet/proposals/models/proposal-option-result.model';
import { GraphOption } from 'app/wallet/proposals/models/proposal-result-graph-option.model';
import { VoteOption } from 'app/wallet/proposals/models/vote-option.model';

export class ProposalResult {
    id: number;
    Proposal: Proposal
    ProposalOptionResults: ProposalOptionResult[];
    createdAt: Date;
    proposalId: number;
    updatedAt: Date;
    private graphOptions: GraphOption[] = [];
    private totalVoteCounts: number = 0;

    constructor(object: any) {
        this.id = object.id;
        this.Proposal = object.Proposal;
        this.ProposalOptionResults = object.ProposalOptionResults.map((v) => new ProposalOptionResult(v));
        this.createdAt = object.createdAt;
        this.proposalId = object.proposalId;
        this.updatedAt = object.updatedAt;
        this.setGraphInformation()
    }

    setGraphInformation(): void {
        this.ProposalOptionResults.map((optionResult: ProposalOptionResult) => {
            const option = new GraphOption({
                description: optionResult.ProposalOption.description,
                voters: optionResult.voters,
                optionId: optionResult.ProposalOption.optionId
            });
            this.addGraphOption(option);
        })
    }

    addGraphOption(option: GraphOption): void {
        this.addVoteCount(option.voters);
        this.graphOptions.push(option)
    }

    /*
     * updatevote method is responsive to maintain the vote option.
     * If already vote to any option the reduce that option count by ``--option.voters``
     * and increate the selected option count ``++option.voters``.
     */

    updateVote(selectedOption: VoteOption, previousOption: VoteOption): void {
        this.graphOptions = this.graphOptions.map((option: GraphOption) => {
            if (previousOption && previousOption.optionId === option.optionId) {
                --option.voters
            }
            if (selectedOption.optionId === option.optionId) {
                ++option.voters
            }
            return new GraphOption(option);
        })

        // increase vote count if new vote.
        if (!previousOption) {
            this.addVoteCount(1);
        }
    }

    addVoteCount(counts: number): void {
        this.totalVoteCounts += counts;
    }

    get graphData(): GraphOption[] {
        return this.graphOptions;
    }

    get totalVotes(): number {
        return this.totalVoteCounts || 0;
    }

    get totalVotesText(): string {
        return this.totalVotes >= 1 ? 'Votes' : 'Vote';
    }
}
