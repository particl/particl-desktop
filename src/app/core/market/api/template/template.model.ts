import { Category } from "app/core/market/api/category/category.model";
import { DateFormatter } from "app/core/util/utils";

export class Template {

    public category: Category = new Category({});
    public createdAt: string = '';

    constructor(private object) {
      this.category = new Category(this.object.ItemInformation.ItemCategory);
      this.createdAt = new DateFormatter(new Date(this.object.createdAt)).dateFormatter(true);
      console.log('item obj l' + this.object.ListingItemObjects.length);
     }

     get id() : number { return this.object.id }
     get title() : string { return this.object.ItemInformation.title }
     get shortDescription() : string { return this.object.ItemInformation.shortDescription }
     get longDescription() : string { return this.object.ItemInformation.longDescription }

     // Status
     get status(): string {
       if (this.object.ListingItemObjects.length > 0) {
          return 'Published';
       } else {
          return 'Unpublished';
       }
    }
    get statusClass(): String { return this.status.toLocaleLowerCase()}
  
    get thumbnail(): any { 
      const itemimage = this.object.ItemInformation.ItemImages[0];
      if(itemimage) {
        return itemimage.ItemImageDatas.find(data => {
          return data.imageVersion === 'THUMBNAIL';
        });
      } 
      return undefined;
    }

    get featuredImage(): any {
      const itemimage = this.object.ItemInformation.ItemImages[0];
      if(itemimage) {
        return itemimage.ItemImageDatas.find(data => {
          return data.imageVersion === 'MEDIUM';
        });
      } 
      return undefined;
    }

    get images(): any { return this.object.ItemInformation.ItemImages; }
  }