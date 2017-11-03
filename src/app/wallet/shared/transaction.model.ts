
interface Deserializable {
    getTypes(): Object;
}

export type TransactionCategory = 'all' | 'stake' | 'coinbase' | 'send' | 'receive' | 'orphaned_stake';

export class Transaction implements Deserializable {
  txid: string;
  address: string;
  stealth_address: string;
  type: string;
  category: string;
  amount: number;
  reward: number;
  blockhash: string;
  blockindex: number;
  confirmations: number;
  time: number;
  comment: string;
  vout: number;
  walletconflicts: Object[];

  constructor(txid: string, address: string, category: string, amount: number, reward: number,
              blockhash: string, blockindex: number, confirmations: number,
              time: number, comment: string, vout: number) { }


  getTypes() {
    // since everything is primitive, we don't need to
    // return anything here
    return {};
  }

  getAmount(): string {
    if (this.category === 'stake') {
      return this.reward.toFixed(8);
    }
    return this.amount.toFixed(8);
  }

  getAddress(): string {
    if (this.stealth_address === undefined) {
      return this.address;
    }
    return this.stealth_address;
  }

  getDate(): string {
    return this.dateFormatter(new Date(this.time * 1000));
  }

  getExpandedTransactionID(): string {
    return this.txid + this.getAmount() + this.category;
  }

  public getNetAmount() {
    const amount : number = +this.getAmount();
    if (amount < 0) { // sent
      return amount + this.fee;
    } else { // received
      return amount - (+this.fee);
    }
  }

  public getConfirmationCount(confirmations: number): string {
    if (this.confirmations > 12) {
      return '12+';
    }
    return this.confirmations.toString();
  }

  private dateFormatter(d: Date) {
    return (
      d.getDate() < 10 ? '0' + d.getDate() : d.getDate()) + '-' +
      ((d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' +
      (d.getFullYear() < 10 ? '0' + d.getFullYear() : d.getFullYear()) + ' ' +
      (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + ':' +
      (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ':' +
      (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()
    );
  }
}

/*
    Deserialize JSON and cast it to a class of "type".
*/

export function deserialize(json: Object, type: any): Transaction {
  const instance = new type();
  const types = instance.getTypes();

  for (const prop in json) {
    if (!json.hasOwnProperty(prop)) {
      continue;
    }
    // Note: disabled for walletconflicts, which is an empty array.
    if (typeof json[prop] === 'object' && prop !== 'walletconflicts') {
      instance[prop] = deserialize(json[prop], types[prop]);
    } else {
      instance[prop] = json[prop];
    }
  }

  return instance;
}

/*
    TEST DATA
*/
export let TEST_TXS_JSON: Object[] = [
  {
    address: 'pknZoCR9qdB2T4D4KpujHHoRLkwH5RX9rq',
    category: 'stake',
    amount: 10000.29073177,
    vout: 1,
    reward: 0.58146354,
    confirmations: 0,
    trusted: false,
    txid: '86e39a91f275df44aa3ab87bfa73b62da38fb0e2750d2e71e6ef281289fa64c8',
    walletconflicts: [
    ],
    time: 1491758368,
    timereceived: 1491758368,
    bip125_replaceable: 'unknown',
    abandoned: true
  },
  {
    address: 'piNdRiuL2BqUA8hh2A6AtEbBkKqKxK13LT',
    category: 'send',
    amount: 10858.44777276,
    vout: 1,
    reward: 0.58146362,
    confirmations: 0,
    trusted: false,
    txid: 'c5f1a969074f07b66e186ed0fafeda967538e6384def41ffc956297e45e2788c',
    walletconflicts: [
    ],
    time: 1491758464,
    timereceived: 1491758464,
    bip125_replaceable: 'unknown',
    abandoned: true
  },
  {
    address: 'pfzBLHLt4beAbYkEXmAeyURuK3NT7nec6j',
    category: 'received',
    amount: 3750.29073184,
    vout: 1,
    reward: 0.58146369,
    confirmations: 0,
    trusted: false,
    txid: '4a816f1fdb0b48e8bb82038c39208659f852f6da17342462fa950137d662b43b',
    walletconflicts: [
    ],
    time: 1491758848,
    timereceived: 1491758848,
    bip125_replaceable: 'unknown',
    abandoned: true
  },
  {
    address: 'pcsGDDTiuE9BueN8AnN9sExPKET27bZ6es',
    category: 'orphaned_stake',
    amount: 2326.20523857,
    vout: 1,
    reward: 0.58146377,
    confirmations: 0,
    trusted: false,
    txid: 'e7e9aa2c688e42e0be595940245adb2a8c7614195b6c67fee6c59d1bb128edeb',
    walletconflicts: [
    ],
    time: 1491759008,
    timereceived: 1491759008,
    bip125_replaceable: 'unknown',
    abandoned: true
  },
  {
    address: 'pfHdjPtAVadD8ENasJANQxFvbR2y9d23M2',
    category: 'orphaned_stake',
    amount: 623.72643299,
    vout: 1,
    reward: 0.58146385,
    confirmations: 0,
    trusted: false,
    txid: '7630e36b65156a13d0d0aa582beaba303c274dfd86845b63b49eda5d41246b10',
    walletconflicts: [
    ],
    time: 1491759184,
    timereceived: 1491759184,
    bip125_replaceable: 'unknown',
    abandoned: true
  },
  {
    address: 'pazQ5mmf65qLpBAgpBMZaJHW9ZLEbVVaFp',
    category: 'orphaned_stake',
    amount: 674.56078620,
    vout: 1,
    reward: 0.58146385,
    confirmations: 0,
    trusted: false,
    txid: '6e2c9bc00a4555859b18004b56e91fb1e961f0d087cdbe6df3b34356902918df',
    walletconflicts: [
    ],
    time: 1491759200,
    timereceived: 1491759205,
    bip125_replaceable: 'unknown',
    abandoned: true
  },
  {
    address: 'prPbxhtc2zSPy3nYF7BF9a3BZ9YfVMdB6t',
    category: 'orphaned_stake',
    amount: 227.99528486,
    vout: 1,
    reward: 0.58146415,
    confirmations: 0,
    trusted: false,
    txid: 'f4f41d2ab7900ad612fffc66e12e06a8f7f078a0e9124e22d0e336845dc25975',
    walletconflicts: [
    ],
    time: 1491760320,
    timereceived: 1491760320,
    bip125_replaceable: 'unknown',
    abandoned: true
  },
  {
    address: 'pY53sfAEJC7KU7wczRoB71J8F9woTQDzdD',
    category: 'orphaned_stake',
    amount: 4343.12574300,
    vout: 1,
    reward: 0.58146423,
    confirmations: 0,
    trusted: false,
    txid: '6895185d13de6d6ba597eb3f4eb89562faf4faf76cae94ffff45e0ceb8a144d5',
    walletconflicts: [
    ],
    time: 1491760480,
    timereceived: 1491760480,
    bip125_replaceable: 'unknown',
    abandoned: true
  }
];

// listtransaction "*" 10 0
export let TEST_ARRAY_TXS_JSON_PAGE_0: Object[] = JSON.parse(`{
"tx" : [
  {
    "address": "pqBdENeMtymB4k3cU67wMtCiK6GMFBfsoh",
    "category": "stake",
    "amount": 15505.21142920,
    "vout": 1,
    "reward": 2.71279178,
    "confirmations": 517,
    "blockhash": "cf56171a06e80545edafa5776be0ca6d30943ca47c20d880dc8ca0cb29e53bcb",
    "blockindex": 0,
    "blocktime": 1497427920,
    "txid": "e9fab9e9dda878c958b2c1c0845bc89aa1d26f217060359b2d0e84817dcfef7f",
    "walletconflicts": [
    ],
    "time": 1497427920,
    "timereceived": 1497427923,
    "bip125_replaceable": "no",
    "abandoned": false
  },
  {
    "account": "",
    "address": "pZmDys6aaHxZ6Gd9d9YE19LT8yRE7ztzwz",
    "category": "send",
    "amount": -1.20000000,
    "vout": 0,
    "fee": -0.00060800,
    "confirmations": 513,
    "blockhash": "c525891543a25c67bbcdd915489df0df0e3efe3ee6216447b094dbae7d740ce4",
    "blockindex": 1,
    "blocktime": 1497433376,
    "txid": "dca6c2db501ab84336f3e8ccf3da0c025d2e6875c17f1bf3ce8eb3f01b6c35f9",
    "walletconflicts": [
    ],
    "time": 1497432974,
    "timereceived": 1497432974,
    "bip125_replaceable": "no",
    "n1": "",
    "abandoned": false
  },
  {
    "address": "pqBdENeMtymB4k3cU67wMtCiK6GMFBfsoh",
    "category": "stake",
    "amount": 7753.13368497,
    "vout": 1,
    "reward": 1.05594075,
    "confirmations": 2,
    "blockhash": "f2dd94cd251d1579ad7fb496c75f3922c7e013cc98677aa608661c218bc605ae",
    "blockindex": 0,
    "blocktime": 1497954880,
    "txid": "43351c358a0734dbb22e8e4fc99eac0ea4b612f3b202c934264cca98e37a4935",
    "walletconflicts": [
    ],
    "time": 1497954880,
    "timereceived": 1497954881,
    "bip125_replaceable": "no",
    "abandoned": false
  },
  {
    "account": "",
    "stealth_address": "TetWaRqu69tHAyoZxfcfCFrSb6ho9hjsoYbjUGZT6FVdBw37Tx4MAEZqBxqfEBNwVsNpNNGAokvJaSJJdZpYA28f9R1GmkUSErEsCG",
    "address": "pi6w4JVqoPGjWxVF4Y8xPtH12uym1PDEJ1",
    "category": "receive",
    "type": "blind",
    "fromself": "true",
    "amount": 0.00000001,
    "fee": -0.00581000,
    "vout": 2,
    "confirmations": 516,
    "blockhash": "8411a7fdc3b5e47d47e8a3c74d4db6aec3c502138e7cc35a3794f6d972df7061",
    "blockindex": 101,
    "blocktime": 1497431136,
    "txid": "f928d812fee5aad393ade602f78796cdf33d48e3d2b75bb4c9a1598b2d72b1b1",
    "walletconflicts": [
    ],
    "time": 1497430155,
    "abandoned": false
  },
  {
    "account": "",
    "stealth_address": "TetWaRqu69tHAyoZxfcfCFrSb6ho9hjsoYbjUGZT6FVdBw37Tx4MAEZqBxqfEBNwVsNpNNGAokvJaSJJdZpYA28f9R1GmkUSErEsCG",
    "address": "pikawDYzkkxvKt9HYC9f4rR1PzkZkviDar",
    "category": "receive",
    "type": "blind",
    "fromself": "true",
    "amount": 0.00000001,
    "fee": -0.00581000,
    "vout": 1,
    "confirmations": 516,
    "blockhash": "8411a7fdc3b5e47d47e8a3c74d4db6aec3c502138e7cc35a3794f6d972df7061",
    "blockindex": 101,
    "blocktime": 1497431136,
    "txid": "f928d812fee5aad393ade602f78796cdf33d48e3d2b75bb4c9a1598b2d72b1b1",
    "walletconflicts": [
    ],
    "time": 1497430155,
    "abandoned": false
  },
  {
    "account": "",
    "stealth_address": "TetabKKwC8TeFwzkyMMfHmN8LEifunGwcCozkJphV5QRBGEs5soZNyJGjXUcfyPrC1YmeXzBUs5du3DMS6UBG45tGFrd4zSLYp6LSC",
    "address": "pquAW8Zd3YoCMVTeanYkchaBY7mBUcWJc7",
    "category": "send",
    "type": "blind",
    "amount": -0.00000001,
    "fee": -0.00581000,
    "vout": 2,
    "confirmations": 513,
    "blockhash": "c525891543a25c67bbcdd915489df0df0e3efe3ee6216447b094dbae7d740ce4",
    "blockindex": 4,
    "blocktime": 1497433376,
    "txid": "108c61e8136e35560af8cee79e80985b412924dc30165575f565f52635e5f1f8",
    "walletconflicts": [
    ],
    "time": 1497432632,
    "abandoned": false
  },
  {
    "account": "",
    "stealth_address": "TetabKKwC8TeFwzkyMMfHmN8LEifunGwcCozkJphV5QRBGEs5soZNyJGjXUcfyPrC1YmeXzBUs5du3DMS6UBG45tGFrd4zSLYp6LSC",
    "address": "pc14Qjdy1JDwqo7WY8NFvYFLBqjMjtFTvV",
    "category": "send",
    "type": "blind",
    "amount": -0.00000001,
    "fee": -0.00581000,
    "vout": 1,
    "confirmations": 513,
    "blockhash": "c525891543a25c67bbcdd915489df0df0e3efe3ee6216447b094dbae7d740ce4",
    "blockindex": 4,
    "blocktime": 1497433376,
    "txid": "108c61e8136e35560af8cee79e80985b412924dc30165575f565f52635e5f1f8",
    "walletconflicts": [
    ],
    "time": 1497432632,
    "abandoned": false
  },
  {
    "account": "",
    "stealth_address": "TetWaRqu69tHAyoZxfcfCFrSb6ho9hjsoYbjUGZT6FVdBw37Tx4MAEZqBxqfEBNwVsNpNNGAokvJaSJJdZpYA28f9R1GmkUSErEsCG",
    "address": "pgkshoaetxgiSJuwm5CpBM6SscMBRxqK41",
    "category": "receive",
    "type": "blind",
    "amount": 0.00000001,
    "vout": 2,
    "confirmations": 513,
    "blockhash": "c525891543a25c67bbcdd915489df0df0e3efe3ee6216447b094dbae7d740ce4",
    "blockindex": 2,
    "blocktime": 1497433376,
    "txid": "4bafd64f0be1672420fb22df760a632bde04e3280a08ba9642880107484bcce1",
    "walletconflicts": [
    ],
    "time": 1497954655
  },
  {
    "account": "",
    "stealth_address": "TetWaRqu69tHAyoZxfcfCFrSb6ho9hjsoYbjUGZT6FVdBw37Tx4MAEZqBxqfEBNwVsNpNNGAokvJaSJJdZpYA28f9R1GmkUSErEsCG",
    "address": "pYrZS8xvrAB6nbF5eJgmBfbEEKRhUba5LZ",
    "category": "receive",
    "type": "blind",
    "amount": 0.00000001,
    "vout": 1,
    "confirmations": 513,
    "blockhash": "c525891543a25c67bbcdd915489df0df0e3efe3ee6216447b094dbae7d740ce4",
    "blockindex": 2,
    "blocktime": 1497433376,
    "txid": "4bafd64f0be1672420fb22df760a632bde04e3280a08ba9642880107484bcce1",
    "walletconflicts": [
    ],
    "time": 1497954655
  },
  {
    "address": "pqBdENeMtymB4k3cU67wMtCiK6GMFBfsoh",
    "category": "stake",
    "amount": 7753.13368506,
    "vout": 1,
    "reward": 1.05594093,
    "confirmations": 1,
    "blockhash": "1608eaae3725a89da24ad3664ce9f5d5afc94e05cd8d56e51257b575b55a44ec",
    "blockindex": 0,
    "blocktime": 1497955632,
    "txid": "9d8a72aa6f091a6d2c5b79bed6b8f165c4187052e7fd90bbae567529d68be0f1",
    "walletconflicts": [
    ],
    "time": 1497955632,
    "timereceived": 1497955632,
    "bip125_replaceable": "no",
    "abandoned": false
  }
]
}`)['tx'];

// listtransaction "*" 10 0
export let TEST_ARRAY_TXS_JSON_PAGE_1: Object[] = JSON.parse(`{
"tx" : [
  {
    "account": "",
    "address": "pXyckXCxbeVDvjychfaoFi7q8WVDPQxMx9",
    "category": "orphan",
    "amount": 4857.76259547,
    "vout": 48,
    "confirmations": 0,
    "generated": true,
    "trusted": false,
    "txid": "8e459fea393d1f98d932f747620268cdbdd6d802f0e121746ba6002e43abac04",
    "walletconflicts": [
    ],
    "time": 1496769008,
    "timereceived": 1496777150,
    "bip125_replaceable": "unknown"
  },
  {
    "account": "",
    "address": "pqBdENeMtymB4k3cU67wMtCiK6GMFBfsoh",
    "category": "orphan",
    "amount": 1.20500000,
    "vout": 67,
    "confirmations": 0,
    "generated": true,
    "trusted": false,
    "txid": "ff63c46f9b0f8488ecc38dad1bbcd2c99d992c6aa2d7817cbb232678e26e02c1",
    "walletconflicts": [
    ],
    "time": 1496771008,
    "timereceived": 1496777150,
    "bip125_replaceable": "unknown"
  },
  {
    "account": "",
    "address": "psdcd5iB8aQX6p6fNQGQjxrncAnYGk8339",
    "category": "orphan",
    "amount": 32385.08396990,
    "vout": 30,
    "confirmations": 0,
    "generated": true,
    "trusted": false,
    "txid": "e28b7f1e62480df53d05aa8c63d783bc242ed0e33c025389f2258d59fe9f94d6",
    "walletconflicts": [
    ],
    "time": 1496771616,
    "timereceived": 1496777150,
    "bip125_replaceable": "unknown"
  },
  {
    "account": "",
    "address": "pbK8QtW1myH4oTDbE1VEbFdXjS2ioiVqjz",
    "category": "orphan",
    "amount": 0.18075000,
    "vout": 76,
    "confirmations": 0,
    "generated": true,
    "trusted": false,
    "txid": "edb8fa81b57c9e122314d99a05dc84cddf6406a518ccc0538a1bf269d70c4cb9",
    "walletconflicts": [
    ],
    "time": 1496772272,
    "timereceived": 1496777150,
    "bip125_replaceable": "unknown"
  },
  {
    "account": "",
    "address": "pXyckXCxbeVDvjychfaoFi7q8WVDPQxMx9",
    "category": "coinbase",
    "amount": 1.15374999,
    "vout": 3,
    "confirmations": 1381,
    "generated": true,
    "blockhash": "8a8bb369b853b74b7d7d33a271cf97c5bed9d083bbc3c1e6e44df98d4d24203f",
    "blockindex": 1,
    "blocktime": 1497275136,
    "txid": "1f883e343ea752735e1f9485a0c201b19fc3fde4762f17fde68b6e58a05efca0",
    "walletconflicts": [
    ],
    "time": 1497275136,
    "timereceived": 1497427442,
    "bip125_replaceable": "no"
  },
  {
    "account": "",
    "address": "pqBdENeMtymB4k3cU67wMtCiK6GMFBfsoh",
    "category": "coinbase",
    "amount": 31007.71006662,
    "vout": 61,
    "confirmations": 1379,
    "generated": true,
    "blockhash": "8546890f69e7f2a27c11462d9eeb23a31ff879c1f14f1e3b70ea414bab1da748",
    "blockindex": 1,
    "blocktime": 1497275840,
    "txid": "e3c8e29573d62c47c08c09e2cb6574fcd1601a00dbdd902bc385856c68eb3d75",
    "walletconflicts": [
    ],
    "time": 1497275840,
    "timereceived": 1497427442,
    "bip125_replaceable": "no"
  },
  {
    "account": "",
    "address": "psdcd5iB8aQX6p6fNQGQjxrncAnYGk8339",
    "category": "coinbase",
    "amount": 0.17306249,
    "vout": 69,
    "confirmations": 1368,
    "generated": true,
    "blockhash": "ddd43161b06e89e7e91337b33d0ae4a327d041e12bf89ec059f253b07733bf7e",
    "blockindex": 1,
    "blocktime": 1497276880,
    "txid": "5ce0f0dac0c83c76f95d318ffaafe674e8d6f7694b6767a88768d3379eba78ec",
    "walletconflicts": [
    ],
    "time": 1497276880,
    "timereceived": 1497427443,
    "bip125_replaceable": "no"
  },
  {
    "account": "",
    "address": "pbK8QtW1myH4oTDbE1VEbFdXjS2ioiVqjz",
    "category": "coinbase",
    "amount": 4651.15650998,
    "vout": 33,
    "confirmations": 1343,
    "generated": true,
    "blockhash": "16cc1e75b2d372a0a866b2d440ba9293ff3711decc9d69c7e0dc1d1bea6c6659",
    "blockindex": 1,
    "blocktime": 1497281184,
    "txid": "ee841a0db3df813779c9fb79efb910504a9704e47e63f1e5053e5a2cabb13aa5",
    "walletconflicts": [
    ],
    "time": 1497281184,
    "timereceived": 1497427449,
    "bip125_replaceable": "no"
  }
]
}`)['tx'];
