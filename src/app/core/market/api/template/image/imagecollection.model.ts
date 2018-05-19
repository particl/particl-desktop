import { Image } from './image.model';

export class ImageCollection {
  constructor(private images: Image[]) {
    this.setImages();
  }

  get thumbnail(): any {
    const itemimage = this.images[0];
    if (itemimage) {
      return itemimage.thumbnail;
    }
    return './assets/images/placeholder_1-1.jpg';
  }

  get featuredImage(): any {
    const itemimage = this.images[0];
    if (itemimage) {
      return itemimage.medium;
    }
    return './assets/images/placeholder_1-1.jpg';
  }

  setImages() {
    this.images = this.images.map(img => new Image(img))
  }

}
