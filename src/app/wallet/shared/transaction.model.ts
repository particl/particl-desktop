
interface Deserializable {
    getTypes(): Object;
}

export type TransactionCategory = "all" | "stake" | "send" | "receive" | "orphaned_stake";

export class Transaction implements Deserializable {
  txid: string;
  address: string;
  category: string;
  amount: number;
  blockhash: string;
  blockindex: number;
  confirmations: number;
  time: number;
  comment: string;
  vout: number;
  walletconflicts: Object[];

  constructor( txid: string, address: string, category: string, amount: number, blockhash: string, blockindex: number, confirmations: number, time: number, comment: string, vout: number) {
    this.txid = txid;
    //Note: only one address,
    this.address = address;
    this.category = category;
    this.amount = amount;
    this.blockhash = blockhash;
    this.blockindex = blockindex;
    this.confirmations = confirmations;
    this.time = time;
    this.comment = comment;
    this.vout = vout;
  }


  getTypes() {
    // since everything is primitive, we don't need to
    // return anything here
    return {};
  }

  getDate(): string {
    return this.dateFormatter(new Date(this.time * 1000));
  }

  private dateFormatter(d : Date) {
    return (
      d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) + "-" +
      ((d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" +
      (d.getFullYear() < 10 ? "0" + d.getFullYear() : d.getFullYear()) + " " +
      (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":" +
      (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()) + ":" +
      (d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()
    );
  }
}

/*
    Deserialize JSON and cast it to a class of "type".
*/

export function deserialize(json, type) {
  var instance = new type(), types = instance.getTypes();

  for (var prop in json) {
    if (!json.hasOwnProperty(prop)) {
      continue;
    }
    //Note: disabled for walletconflicts, which is an empty array.
    if (typeof json[prop] === 'object' && prop != "walletconflicts") {
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
export var TEST_TXS_JSON: Object[] = [
  {
    address: "pknZoCR9qdB2T4D4KpujHHoRLkwH5RX9rq",
    category: "stake",
    amount: 10000.29073177,
    vout: 1,
    reward: 0.58146354,
    confirmations: 0,
    trusted: false,
    txid: "86e39a91f275df44aa3ab87bfa73b62da38fb0e2750d2e71e6ef281289fa64c8",
    walletconflicts: [
    ],
    time: 1491758368,
    timereceived: 1491758368,
    bip125_replaceable: "unknown",
    abandoned: true
  },
  {
    address: "piNdRiuL2BqUA8hh2A6AtEbBkKqKxK13LT",
    category: "send",
    amount: 10858.44777276,
    vout: 1,
    reward: 0.58146362,
    confirmations: 0,
    trusted: false,
    txid: "c5f1a969074f07b66e186ed0fafeda967538e6384def41ffc956297e45e2788c",
    walletconflicts: [
    ],
    time: 1491758464,
    timereceived: 1491758464,
    bip125_replaceable: "unknown",
    abandoned: true
  },
  {
    address: "pfzBLHLt4beAbYkEXmAeyURuK3NT7nec6j",
    category: "received",
    amount: 3750.29073184,
    vout: 1,
    reward: 0.58146369,
    confirmations: 0,
    trusted: false,
    txid: "4a816f1fdb0b48e8bb82038c39208659f852f6da17342462fa950137d662b43b",
    walletconflicts: [
    ],
    time: 1491758848,
    timereceived: 1491758848,
    bip125_replaceable: "unknown",
    abandoned: true
  },
  {
    address: "pcsGDDTiuE9BueN8AnN9sExPKET27bZ6es",
    category: "orphaned_stake",
    amount: 2326.20523857,
    vout: 1,
    reward: 0.58146377,
    confirmations: 0,
    trusted: false,
    txid: "e7e9aa2c688e42e0be595940245adb2a8c7614195b6c67fee6c59d1bb128edeb",
    walletconflicts: [
    ],
    time: 1491759008,
    timereceived: 1491759008,
    bip125_replaceable: "unknown",
    abandoned: true
  },
  {
    address: "pfHdjPtAVadD8ENasJANQxFvbR2y9d23M2",
    category: "orphaned_stake",
    amount: 623.72643299,
    vout: 1,
    reward: 0.58146385,
    confirmations: 0,
    trusted: false,
    txid: "7630e36b65156a13d0d0aa582beaba303c274dfd86845b63b49eda5d41246b10",
    walletconflicts: [
    ],
    time: 1491759184,
    timereceived: 1491759184,
    bip125_replaceable: "unknown",
    abandoned: true
  },
  {
    address: "pazQ5mmf65qLpBAgpBMZaJHW9ZLEbVVaFp",
    category: "orphaned_stake",
    amount: 674.56078620,
    vout: 1,
    reward: 0.58146385,
    confirmations: 0,
    trusted: false,
    txid: "6e2c9bc00a4555859b18004b56e91fb1e961f0d087cdbe6df3b34356902918df",
    walletconflicts: [
    ],
    time: 1491759200,
    timereceived: 1491759205,
    bip125_replaceable: "unknown",
    abandoned: true
  },
  {
    address: "prPbxhtc2zSPy3nYF7BF9a3BZ9YfVMdB6t",
    category: "orphaned_stake",
    amount: 227.99528486,
    vout: 1,
    reward: 0.58146415,
    confirmations: 0,
    trusted: false,
    txid: "f4f41d2ab7900ad612fffc66e12e06a8f7f078a0e9124e22d0e336845dc25975",
    walletconflicts: [
    ],
    time: 1491760320,
    timereceived: 1491760320,
    bip125_replaceable: "unknown",
    abandoned: true
  },
  {
    address: "pY53sfAEJC7KU7wczRoB71J8F9woTQDzdD",
    category: "orphaned_stake",
    amount: 4343.12574300,
    vout: 1,
    reward: 0.58146423,
    confirmations: 0,
    trusted: false,
    txid: "6895185d13de6d6ba597eb3f4eb89562faf4faf76cae94ffff45e0ceb8a144d5",
    walletconflicts: [
    ],
    time: 1491760480,
    timereceived: 1491760480,
    bip125_replaceable: "unknown",
    abandoned: true
  }
];
