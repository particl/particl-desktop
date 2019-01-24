
export class Image {
  constructor(public image: any) {
  }

  get id(): number {
    return this.image.id;
  }

  get thumbnail(): string {
    const image = this.image.ItemImageDatas.find((o) => o.imageVersion === 'THUMBNAIL')
    return (image && image.dataId) || './assets/images/placeholder_1-1.jpg'
  }

  get original(): string {
    const image = this.image.ItemImageDatas.find(o => o.imageVersion === 'ORIGINAL')
    return (image && image.dataId) || './assets/images/placeholder_1-1.jpg'
  }

  get medium(): string {
    const image = this.image.ItemImageDatas.find((o) => o.imageVersion === 'MEDIUM')
    return (image && image.dataId) || './assets/images/placeholder_1-1.jpg'

  }

  get large(): string {
    const image = this.image.ItemImageDatas.find(o => o.imageVersion === 'LARGE')
    return (image && image.dataId) || './assets/images/placeholder_1-1.jpg'
  }

  get originalEncoding(): string {
    const image = this.image.ItemImageDatas.find(o => o.imageVersion === 'ORIGINAL');
    let data = '';
    if (image) {
      if (image.originalMime && (image.encoding === 'BASE64') && image.ItemImageDataContent && image.ItemImageDataContent.data) {
        data += `data:${image.originalMime};${image.encoding.toLowerCase()},${image.ItemImageDataContent.data}`
      }
    }
    return data;
  }

}

export class DefaultImage extends Image {
 constructor() {
    const imageObject = {
      ItemImageDatas: []
    };
    super(imageObject)
  }
}
