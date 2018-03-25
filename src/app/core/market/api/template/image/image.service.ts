import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';

@Injectable()
export class ImageService {
  
  log: any = Log.create('image.service');

  constructor(private market: MarketService) { }

  add(templateId: number, dataURI: any) {
    return this.market.uploadImage(templateId, dataURI);
  }

  remove(imageId: number) {
    return this.market.call('template', ['image', 'remove', imageId]);
  }

  /**
   * 
   * @param templateId the template id to attach the images to.
   * @param images array of base64 dataURI's to upload.
   */
  public upload(templateId: number, images: Array<any>): Promise<number> {
    let nPicturesAdded = 0;

    return new Promise((resolve, reject) => {
      images.map(picture => {
        this.log.d('Uploading pictures!');
        this.add(templateId, picture).take(1).subscribe(res => {
          console.log(res);
          if (++nPicturesAdded === images.length) {
            this.log.d('All images uploaded!');
            resolve(templateId);
          }
        });

      });
    });
  }

}
