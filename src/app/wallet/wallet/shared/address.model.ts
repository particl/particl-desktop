interface Deserializable {
    getTypes(): Object;
}

export enum AddressType {
    NORMAL,
    STEALTH,
    MULTISIG
}

export class Address implements Deserializable {
  address: string;
  publicKey: string;
  label: string;
  purpose: string;
  rootId: string;
  path: string;

  constructor( address: string, publicKey: string, label: string, purpose: string, rootId: string, path: string) { }

  getTypes() {
    // since everything is primitive, we don't need to
    // return anything here
    return {};
  }
}

/*
Deserialize JSON and cast it to a class of "type".
*/
export function deserialize(json: Object, type: any): Address {
    const instance = new type(), types = instance.getTypes();

    for (const prop in json) {
      if (!json.hasOwnProperty(prop)) {
          continue;
      }
      // Note: disabled for walletconflicts, which is an empty array.
      if (typeof json[prop] === 'object') {
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
export let TEST_ADDRESSES_JSON: Object[] = [
    {
        address: 'PdVwKsTiksmqYZJAnM8jpktfQdQ1YTe7JY',
        publicKey: 'PdVwKsTiksmqYZJAnM8jpktfQdQ1YTe7JY',
        label: 'Exchange',
        type: 'normal',
        root: 'AbUL5vpWYDDda9AVP88QUGmd33Kg8aS8eh',
        path: 'm/0/5'
    },
    {
        address: 'PsUjZnZikdqfYZJAnM8jpktfQdQ1YTe7JY',
        publicKey: 'PsUjZnZikdqfYZJAnM8jpktfQdQ1YTe7JY',
        label: 'Default',
        type: 'normal',
        root: 'AbUL5vpWYDDda9AVP88QUGmd33Kg8aS8eh',
        path: 'm/0/5'
    }
];
