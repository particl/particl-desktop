
export class Image {
  constructor(private image: any) {
  }

  get thumbnail(): string {
    const image = this.image.ItemImageDatas.find((o) => o.imageVersion === 'THUMBNAIL')
    return image.dataId ? image.dataId : './assets/images/placeholder_1-1.jpg'
  }

  get original(): void {
    const image = this.image.ItemImageDatas.find(o => o.imageVersion === 'ORIGINAL')
    return image.dataId ? image.dataId : './assets/images/placeholder_1-1.jpg'
  }

  get medium(): void {
    const image = this.image.ItemImageDatas.find((o) => o.imageVersion === 'MEDIUM')
    return image.dataId ? image.dataId : './assets/images/placeholder_1-1.jpg'

  }

  get large(): void {
    const image = this.image.ItemImageDatas.find(o => o.imageVersion === 'LARGE')
    return image.dataId ? image.dataId : './assets/images/placeholder_1-1.jpg'
  }

}
