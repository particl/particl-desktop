import { Category } from "app/core/market/api/category/category.model";

export class Template {

    constructor(private object) {
      console.log('item obj l' + this.object.ListingItemObjects.length);
     }

     get id() : number { return this.object.id }
     get title() : string { return this.object.ItemInformation.title }
     get shortDescription() : string { return this.object.ItemInformation.shortDescription }
     get longDescription() : string { return this.object.ItemInformation.longDescription }
     get category(): Category { return new Category(this.object.ItemInformation.ItemCategory)}

     // Status
     get status(): string {
       if (this.object.ListingItemObjects.length > 0) {
          return 'Published';
       } else {
          return 'Unpublished';
       }
    }
    get statusClass(): String { return this.status.toLocaleLowerCase()}
  
  }