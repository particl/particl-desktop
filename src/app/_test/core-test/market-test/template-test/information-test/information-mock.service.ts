import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { updateData } from './mock-data'

@Injectable()
export class InformationMockService {

  constructor() { }

  public update(templateId: number, title: string, shortDesc: string, longDesc: string, categoryId: number) {
    return of(updateData);
  }

}
