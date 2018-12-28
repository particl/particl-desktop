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
  totalPercentage: number = 0;
  weightPercentage: number = 0;
  totalWeight: number = 0;
  private graphOptions: GraphOption[] = [];
  private totalVoteCounts: number = 0;

  constructor(object: any) {
    this.id = object.id;
    this.Proposal = object.Proposal;
    this.ProposalOptionResults = object.ProposalOptionResults.map((v) => new ProposalOptionResult(v));
    this.createdAt = object.createdAt;
    this.proposalId = object.proposalId;
    this.updatedAt = object.updatedAt;
    this.setTotalWeight();
    this.setGraphInformation()
  }

  setTotalWeight(): void {
    this.ProposalOptionResults.map((optionResult: ProposalOptionResult) => {
      this.totalWeight += optionResult.weight;
    })
  }

  setGraphInformation(): void {
    this.ProposalOptionResults.map((optionResult: ProposalOptionResult) => {
      if (optionResult.weight) {
        this.weightPercentage = (optionResult.weight / this.totalWeight) * 100;
      }
      const option = new GraphOption({
        description: this.weightPercentage + '%',
        voters: optionResult.voters,
        optionId: optionResult.ProposalOption.optionId,
        weight: optionResult.weight
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
   * If already vote to any option the reduce or increase the totalweight and percentage
   */

  updateVote(selectedOption: VoteOption, previousOption: VoteOption, balance: number): void {
    this.graphOptions = this.graphOptions.map((option: GraphOption) => {
      if (previousOption && previousOption.optionId === option.optionId) {
        option.weight = this.getWeightInPercentage(balance);
      }
      if (selectedOption.optionId === option.optionId) {
        option.weight = this.getWeightInPercentage(balance);
      }
      return new GraphOption(option);
    })

    // increase vote count if new vote.
    if (!previousOption) {
      this.totalWeight += balance;
    }
  }

  addVoteCount(counts: number): void {
    this.totalVoteCounts += counts;
  }

  getWeightInPercentage(weight: number): number {
    return (weight / this.totalWeight) * 100;
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
