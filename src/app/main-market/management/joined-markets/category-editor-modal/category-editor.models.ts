
export class CategoryFlatNode {
  id: number;
  name: string;
  level: number;
  hasChildren: boolean;
}


export class CategoryNode {
  id: number;
  name: string;
  children: CategoryNode[];
}
