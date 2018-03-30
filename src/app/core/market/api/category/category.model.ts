export class Category {
  subCategoryList: Array<Category> = [];
  get name() { return this.category.name };
  get id() { return this.category.id };

  constructor(private category: any) {
    if (category.ChildItemCategories) {
      this.setSubCategoryList();
    }
   }

  // get subcategories (All level)
  setSubCategoryList() {
    const list = this.category.ChildItemCategories;
    list.forEach(o => {
      this.subCategoryList.push(new Category(o));
      this.getChild(o.ChildItemCategories);
    });
  }

  getChild(childs: any) {
    childs.forEach(o => {
      this.subCategoryList.push(new Category(o));
    });
  }

  getSubCategory(): Array<any> {
    return this.subCategoryList;
  }

}
