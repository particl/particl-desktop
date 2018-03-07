export class Category {
  subCategoryList: Array<Category>;

  get name() {
    return this.category.name
  };

  get id() {
    return this.category.id
  };

  constructor(private category: any) {
    if (category.ChildItemCategories) {
      this.setSubCategoryList();
    }
  }

  // get subcategories (single level)
  setSubCategoryList() {
    const list = this.category.ChildItemCategories;
    this.subCategoryList = list.map(o => {
      return new Category(o)
    });
  }

  getSubCategoryNames(): Array<string> {
    return this.subCategoryList.map(o => {
      return o.name
    });
  }

}
