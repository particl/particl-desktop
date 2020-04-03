

/** Flat category node with expandable and level information */
export class ItemFlatNode {
  id: number | string;
  item: string;
  level: number;
  expandable: boolean;
}


export class InputItem {
  id: number | string;
  name: string;
  children: InputItem[];
}

export class ItemNode {
  id: number | string;
  item: string;
  children: ItemNode[];
}
