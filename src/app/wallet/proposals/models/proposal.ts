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

  constructor(obj: any) {
    this.id = obj.id;
    this.title = obj.title;
    this.options = obj.options.map(v => new VoteOption(v));
    this.description = obj.description;
    this.hash = obj.hash;
    this.type = obj.type;
    this.submitter = obj.submitter;
    this.blockStart = obj.blockStart;
    this.blockEnd = obj.blockEnd;
  }

  public isActiveProposal(currentBlockCount: number): boolean {
    return currentBlockCount < this.blockEnd;
  }

  public leftVotingEndBlockCount(currentBlockCount: number) {
    const leftBlocks = this.blockEnd - currentBlockCount;
    return leftBlocks > 0 ? leftBlocks : 0;
  }

  public votingProgressPercentage(currentBlockCount: number) {
    const blocks = this.blockEnd - this.blockStart;
    const leftBlock = this.leftVotingEndBlockCount(currentBlockCount);
    if (!leftBlock) {
      return 100;
    }
    const progressPerc = 100 - Math.ceil(((leftBlock) / (blocks / 100)) * 100);

    return progressPerc || 0;
  }
}
