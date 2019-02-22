const proposalResult = {
  'id': 59,
  'proposalId': 85,
  'calculatedAt': 1544597197208,
  'updatedAt': 1544597230122,
  'createdAt': 1544597197208,
  'Proposal': {
    'id': 85,
    'submitter': 'pkvG58g7aZYdvECVgfVc2QHzqmpTqcn5h4',
    'hash': '8237fe3f87a27f68077eba1e069f5635137a8cb0c56e95cdd0d33cdfdadf719e',
    'item': null,
    'type': 'PUBLIC_VOTE',
    'title': 'intel or amd',
    'description': 'which is better for development, intel / amd based machines',
    'timeStart': 1544530855000,
    'postedAt': 1544530855000,
    'receivedAt': 1544597165000,
    'expiredAt': 1545135655000,
    'updatedAt': 1544597196127,
    'createdAt': 1544597196127
  },
  'ProposalOptionResults': [{
    'id': 145,
    'proposalResultId': 59,
    'proposalOptionId': 191,
    'weight': 1,
    'voters': 1,
    'updatedAt': 1544597230160,
    'createdAt': 1544597197217,
    'ProposalOption': {
      'id': 191,
      'proposalId': 85,
      'optionId': 0,
      'description': 'intel',
      'hash': 'cc4252cbf011251c337604b00e6f0d547e2d8cf7fd64f98a516a7fc29ff54d1b',
      'updatedAt': 1544597197164,
      'createdAt': 1544597197164
    }
  },
  {
    'id': 146,
    'proposalResultId': 59,
    'proposalOptionId': 192,
    'weight': 4,
    'voters': 4,
    'updatedAt': 1544597230194,
    'createdAt': 1544597197230,
    'ProposalOption': {
      'id': 192,
      'proposalId': 85,
      'optionId': 1,
      'description': 'amd',
      'hash': '791f4eafebd9fab7019200f14bbeb4d61003d1ba28d5fa8e4285d4957cee24cf',
      'updatedAt': 1544597197181,
      'createdAt': 1544597197181
    }
  }]
}


export {
  proposalResult
}
