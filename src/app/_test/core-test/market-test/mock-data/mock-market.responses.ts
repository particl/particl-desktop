import { proposalList, proposalResult } from 'app/_test/core-test/market-test/proposal-test/mock-data/proposal';
import { voteGet } from 'app/_test/core-test/market-test/proposal-test/mock-data/vote';
import { informationUpdate } from 'app/_test/core-test/market-test/template-test/information-test/mock-data';


const Responses = {
  proposal: {
    list: proposalList,
    result: proposalResult
  },
  vote: {
    get: voteGet
  },
  template: {
    information:  {
      update: informationUpdate
    }
  }
}
export {
  Responses
}
