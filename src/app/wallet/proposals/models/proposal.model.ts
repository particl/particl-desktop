import { VoteOption } from './vote-option.model';

export class Proposal {
  public title: any
  public options: any
  public submitter: any
  public blockStart: any
  public blockEnd: any
  public description: any
  public type: any
  public hash: any
  public id: any

  constructor(private proposal: any) {
    this.title = this.proposal.title;
    this.options = this.proposal.ProposalOptions.map(v => new VoteOption(v));
    this.submitter = this.proposal.submitter;
    this.blockStart = this.proposal.blockStart;
    this.blockEnd = this.proposal.blockEnd;
    this.description = this.proposal.description;
    this.type = this.proposal.type;
    this.hash = this.proposal.hash;
    this.id = this.proposal.id;
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
