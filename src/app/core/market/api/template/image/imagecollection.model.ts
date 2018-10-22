import { Image, DefaultImage } from './image.model';

export class ImageCollection {
  private default: Image = new DefaultImage();
  private preview: Image;
  imageUrls: string[] = [];
  constructor(public images: Image[]) {
    this.setImages();
    this.setImageUrls();
    this.preview = this.images[0]
  }

  get featuredImage(): Image {
    return this.images[0] || this.default;
  }

  get previewImage(): Image {
    return this.preview || this.default;
  }

  setImages() {
    this.images = this.images.map(img => new Image(img))
  }

  setImageUrls(): void {
    this.imageUrls  = this.images.map((img) => img.medium)
  }

  setPreviewImage(image: Image) {
    this.preview = image;
  }

}
