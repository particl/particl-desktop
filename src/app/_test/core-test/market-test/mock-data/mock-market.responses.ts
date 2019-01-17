import { proposalList, proposalResult } from 'app/_test/core-test/market-test/proposal-test/mock-data/proposal';
import { voteGet } from 'app/_test/core-test/market-test/proposal-test/mock-data/vote';
import { escrowAdd, escrowUpdate } from 'app/_test/core-test/market-test/template-test/escrow-test/mock-data/';


const Responses = {
  proposal: {
    list: proposalList,
    result: proposalResult
  },
  vote: {
    get: voteGet
  },
  template: {
    escrow: {
      add: escrowAdd,
      update: escrowUpdate
    },
  }
}
export {
  Responses
}
