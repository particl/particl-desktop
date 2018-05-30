import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { Template } from 'app/core/market/api/template/template.model';

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
   * @param template a template to attach the images to.
   * @param images array of base64 dataURI's to upload.
   *
   * Returns the old template (not with images, do a new call)
   */
  public upload(template: Template, images: Array<any>): Promise<Template> {
    let nPicturesAdded = 0;

    return new Promise((resolve, reject) => {
      images.map(picture => {
        this.log.d('Uploading pictures to templateId=', template.id);
        this.add(template.id, picture).take(1).subscribe(res => {
          if (++nPicturesAdded === images.length) {
            this.log.d('All images uploaded!');
            resolve(template);
          }
        });

      });
    });
  }

}
