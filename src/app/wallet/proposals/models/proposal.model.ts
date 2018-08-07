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

  public leftVotingEndBlockCount(currentBlockCount: number): number {
    /*
     * i.e.
     *  current block count = 100;
     *  blockEnd = 100;
     *  So leftBlock = 0;
     *  And in that case use can vote for that active proposal for the perticular block count?
     *  So :
     *            leftBlocks = (this.blockEnd - currentBlockCount) + 1 ```
     *  for that last block count.
     */

    const leftBlocks = (this.blockEnd - currentBlockCount) + 1 ;
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
