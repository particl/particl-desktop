import { VoteOption } from './vote-option.model';

export class Proposal {
  public title: string;
  public options: VoteOption[];
  public submitter: string;
  public blockStart: number;
  public blockEnd: number;
  public description: string;
  public type: string;
  public hash: string;
  public id: number;

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
