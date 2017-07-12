interface Deserializable {
    getTypes(): Object;
}

export class Address implements Deserializable {
  address: string;
  label: string;
  owned: string;
  root: string;
  path: string;

  constructor( address: string, label: string, owned: string, root: string, path: string) {
    this.address = address;
    this.label = label;
    this.owned = owned;
    this.root = root;
    this.path = path;
  }

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

