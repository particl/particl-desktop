import { Image } from './image.model';

export class ImageCollection {
  constructor(private images: Image[]) {
    this.setImages();
  }

  setImages() {
    this.images = this.images.map(img => new Image(img))
  }

}
