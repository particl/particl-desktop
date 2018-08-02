import { VoteOption } from './vote-option.model';

export class Proposal {
  constructor(private proposal: any) { }

  get title(): string {
    return this.proposal.title;
  }

  get options(): VoteOption[] {
    return this.proposal.ProposalOptions.map(v => new VoteOption(v));
  }

  get submitter(): string {
    return this.proposal.submitter;
  }

  get blockStart(): number {
    return this.proposal.blockStart;
  }

  get blockEnd(): number {
    return this.proposal.blockEnd;
  }

  get description(): string {
    return this.proposal.description;
  }

  get type(): string {
    return this.proposal.type;
  }

  get hash(): string {
    return this.proposal.hash;
  }

  get id () {
    return this.proposal.id;
  }

  public isActiveProposal(currentBlockCount: number): boolean {
    return currentBlockCount < this.blockEnd;
  }

  public leftVotingEndBlockCount(currentBlockCount: number): number {
    const leftBlocks = this.blockEnd - currentBlockCount;
    return leftBlocks > 0 ? leftBlocks : 0;
  }

  public votingProgressPercentage(currentBlockCount: number): number {
    const blocks = this.blockEnd - this.blockStart;
    const leftBlock = this.leftVotingEndBlockCount(currentBlockCount);
    if (!leftBlock) {
      return 100;
    }
    const progressPerc = 100 - Math.ceil(((leftBlock) / (blocks / 100)) * 100);

    return progressPerc || 0;
  }
}
