

/** Flat category node with expandable and level information */
export class ItemFlatNode {
  id: number;
  item: string;
  level: number;
  expandable: boolean;
}


export class InputItem {
  id: number;
  name: string;
  parent: number;
  children: InputItem[];
}

export class ItemNode {
  id: number;
  item: string;
  children: ItemNode[];
}
