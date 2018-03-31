export class Category {
  subCategoryList: Array<Category>;
  get name() { return this.category.name };
  get id() { return this.category.id };

  constructor(private category: any) {
    if (category.ChildItemCategories) {
      this.setSubCategoryList();
    }
   }

  // get subcategories (single level)
  setSubCategoryList() {
    const list = this.category.ChildItemCategories;
    this.subCategoryList = list.map(o => { return new Category(o)});
  }

  getSubCategory(): Array<any> {
    return this.subCategoryList;
  }

  getFlatSubCategory(): Array<Category> {
    let temp: Array<Category> = [];

    // push our own category to the list
    temp.push(this);

    // recursively add subcategories
    if (this.subCategoryList) {
      this.subCategoryList.forEach((category: Category) => {
          temp = temp.concat(category.getFlatSubCategory());
        });
    }
    return temp;
  }

}
