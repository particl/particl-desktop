import { Image, DefaultImage } from './image.model';

export class ImageCollection {
  constructor(private images: Image[]) {
    this.setImages();
  }

  get featuredImage(): Image {
    const itemimage = this.images[0];
    if (itemimage) {
      return itemimage;
    }
    return new DefaultImage();
  }

  setImages() {
    this.images = this.images.map(img => new Image(img))
  }

}
