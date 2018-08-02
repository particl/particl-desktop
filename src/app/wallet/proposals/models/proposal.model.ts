import { VoteOption } from './vote-option';

export class Proposal {
  public id: number;
  public title: string;
  public options: VoteOption[];
  public submitter: string;
  public blockStart: number;
  public blockEnd: number;
  public description: string;
  public type: string;
  public hash: string;

  constructor(object: any) {
    this.id = object.id;
    this.title = object.title;
    this.options = object.ProposalOptions.map(v => new VoteOption(v));
    this.description = object.description;
    this.hash = object.hash;
    this.type = object.type;
    this.submitter = object.submitter;
    this.blockStart = object.blockStart;
    this.blockEnd = object.blockEnd;
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
