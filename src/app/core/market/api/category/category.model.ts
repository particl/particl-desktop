import * as _ from 'lodash';

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
    this.subCategoryList = _.concat(list, _.flatMap(list, item =>
      _.map(item.ChildItemCategories, ChildItemCategories => _.defaults({}, ChildItemCategories))
    ));
  }

  getSubCategory(): Array<any> {
    return this.subCategoryList;
  }

}
