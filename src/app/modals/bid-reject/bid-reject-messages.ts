export const BID_REJECT_MESSAGES = {
  NO_REASON: { order: 1, text: 'No reason provided'},
  OUT_OF_STOCK: { order: 2, text: 'Item not in stock'}
};

const sortedMsgs = Object.keys(BID_REJECT_MESSAGES).map((key) => {
  return { key: key, ...BID_REJECT_MESSAGES[key]}
}).sort((a: any, b: any) => {
  return a.order < b.order ? -1 : a.order > b.order ? 1 : 0
});

export const SORTED_BID_REJECT_MESSAGES = sortedMsgs;
