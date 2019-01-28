import { proposalList, proposalResult } from 'app/_test/core-test/market-test/proposal-test/mock-data/proposal';
import { voteGet } from 'app/_test/core-test/market-test/proposal-test/mock-data/vote';
import { locationAdd, locationUpdate } from 'app/_test/core-test/market-test/template-test/location-test/mock-data';
import { listingSearch, listingGet } from 'app/_test/core-test/market-test/listing-test/mock-data';


const Responses = {
  proposal: {
    list: proposalList,
    result: proposalResult
  },
  vote: {
    get: voteGet
  },
  template: {
    location: {
      add: locationAdd,
      update: locationUpdate
    }
  },
  item: {
    get: listingGet,
    search: listingSearch
  }
}
export {
  Responses
}
