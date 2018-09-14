import { Image, DefaultImage } from './image.model';

export class ImageCollection {
  private default: Image = new DefaultImage();
  private image: Image;
  constructor(public images: Image[]) {
    this.setImages();
    this.image = this.images[0]
  }

  get featuredImage(): Image {
    return this.images[0] || this.default;
  }

  get previewImage(): Image {
    return this.image || this.default;
  }

  setImages() {
    this.images = this.images.map(img => new Image(img))
  }

  setPreviewImage(image: Image) {
    this.image = image;
  }

}
