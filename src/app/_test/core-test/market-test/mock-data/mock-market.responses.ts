import { proposalList, proposalResult } from 'app/_test/core-test/market-test/proposal-test/mock-data/proposal';
import { voteGet } from 'app/_test/core-test/market-test/proposal-test/mock-data/vote';


const Responses = {
  proposal: {
    list: proposalList,
    result: proposalResult
  },
  vote: {
    get: voteGet
  }
}
export {
  Responses
}
