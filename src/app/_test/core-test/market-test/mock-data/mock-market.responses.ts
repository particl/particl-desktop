import { proposalList, proposalResult } from 'app/_test/core-test/market-test/proposal-test/mock-data/proposal';
import { voteGet } from 'app/_test/core-test/market-test/proposal-test/mock-data/vote';
import { templateAdd, templateGet, templatePost, templateSearch } from 'app/_test/core-test/market-test/template-test/mock-data';


const Responses = {
  proposal: {
    list: proposalList,
    result: proposalResult
  },
  vote: {
    get: voteGet
  },
  template: {
    add: templateAdd,
    get: templateGet,
    search: templateSearch,
    post: templatePost
  }
}
export {
  Responses
}
