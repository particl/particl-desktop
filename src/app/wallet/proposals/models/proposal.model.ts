import { VoteOption } from './vote-option.model';
import { Duration } from 'app/core/util/utils';

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
  createdAt: number;
  expiredAt: number;

  constructor(object: any) {
    this.title = object.title;
    this.options = object.ProposalOptions.map(v => new VoteOption(v));
    this.submitter = object.submitter;
    this.blockStart = object.blockStart;
    this.blockEnd = object.blockEnd;
    this.description = object.description;
    this.type = object.type;
    this.hash = object.hash;
    this.id = object.id;
    this.createdAt = object.createdAt;
    this.expiredAt = object.expiredAt;
  }

  getTimeStamp(type: string): String {
    if (type === 'left') {
      return new Duration((this.expiredAt - Date.now()) / 1000).getReadableDuration()
    } else {
      return new Duration((Date.now() - this.expiredAt) / 1000).getReadableDuration()
    }
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
