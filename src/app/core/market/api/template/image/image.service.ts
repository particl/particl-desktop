import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { Template } from 'app/core/market/api/template/template.model';
import { take } from 'rxjs/operators';

@Injectable()
export class ImageService {

  log: any = Log.create('image.service');

  constructor(private market: MarketService) { }

  add(templateId: number, dataURIs: Array<any>) {
    return this.market.uploadImage(templateId, dataURIs);
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
    return new Promise((resolve, reject) => {
      if (images.length) {
        this.add(template.id, images).pipe(take(1)).subscribe(res => {
          resolve(template);
        }, error => {

          this.log.d(`error in image upload of template: ${template.id}`)
          reject(error);
        });

      } else {
        resolve(template);
      }
    });
  }

}
