export class Template {

    constructor(private object) {
      console.log('item obj l' + this.object.ListingItemObjects.length);
     }

     get status() {
       if (this.object.ListingItemObjects.length > 0) {
          return 'Published';
       } else {
          return 'Unpublished';
       }
    }

    get statusClass() {
      return this.status.toLocaleLowerCase();
    }
  
  }