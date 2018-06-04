import { Image, DefaultImage } from './image.model';

export class ImageCollection {
  private default: Image = new DefaultImage();
  constructor(public images: Image[]) {
    this.setImages();
  }

  get featuredImage(): Image {
    const itemimage = this.images[0];
    return itemimage || this.default;
  }

  setImages() {
    this.images = this.images.map(img => new Image(img))
  }

}
