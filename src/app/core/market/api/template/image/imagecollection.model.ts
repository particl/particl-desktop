import { Image, DefaultImage } from './image.model';
import { ImageItem } from '@ngx-gallery/core';

export class ImageCollection {
  private default: Image = new DefaultImage();
  private preview: Image;
  imageItems: any [];

  constructor(public images: Image[]) {
    this.setImages();
    this.setImageItems();
    this.preview = this.images[0]
  }

  get featuredImage(): Image {
    return this.images[0] || this.default;
  }

  get previewImage(): Image {
    return this.preview || this.default;
  }

  setImageItems(): void {
    this.imageItems = this.images.map((img) => (new ImageItem(img.medium, img.thumbnail)))
  }

  setImages() {
    this.images = this.images.map(img => new Image(img))
  }

  setPreviewImage(image: Image) {
    this.preview = image;
  }

}
