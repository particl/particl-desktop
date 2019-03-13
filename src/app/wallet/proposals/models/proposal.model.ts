import { VoteOption } from './vote-option.model';
import { Duration } from 'app/core/util/utils';

export class Proposal {
  public title: string;
  public options: VoteOption[];
  public submitter: string;
  public description: string;
  public type: string;
  public hash: string;
  public id: number;
  createdAt: number;
  expiredAt: number;
  isExpiredAtValid: boolean;

  constructor(object: any) {
    this.title = object.title;
    this.options = object.ProposalOptions.map(v => new VoteOption(v));
    this.submitter = object.submitter;
    this.description = object.description;
    this.type = object.type;
    this.hash = object.hash;
    this.id = object.id;
    this.createdAt = object.createdAt;
    this.expiredAt = object.expiredAt;
    /**
     * object.expiredAt is equals MAX_SAFE_INTEGER = 9007199254740991. if the proposal is not publish.
     * (once smsg message sent and recieveed) expiry time will be change as it is actual instead of
     * MAX_SAFE_INTEGER = 9007199254740991.
     */

    this.isExpiredAtValid = Number.isSafeInteger(object.expiredAt) && object.expiredAt < Number.MAX_SAFE_INTEGER;
  }

  get expiryTimeStamp(): String {
    if (this.expiredAt > Date.now()) {
      return new Duration((this.expiredAt - Date.now()) / 1000).getReadableDuration()
    } else {
      return new Duration((Date.now() - this.expiredAt) / 1000).getReadableDuration()
    }
  }

  public votingProgressPercentage(): number {
    const leftTime = this.expiredAt - Date.now();

    if (leftTime <= 0) {
      return 100;
    }

    const progressPerc = Math.round(100 - (leftTime * 100) / (this.expiredAt - this.createdAt));
    return progressPerc || 0;
  }
}
