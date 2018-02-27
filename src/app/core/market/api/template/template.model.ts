export class Template {

    constructor(private template) {

     }

     get status() {
       if (this.template)
       return 'unpublished'
    }
  
  }