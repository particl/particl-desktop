import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { Template } from 'app/core/market/api/template/template.model';
import { getData, searchData, postData, addData } from './../mock-data/template-mock-data';

@Injectable()
export class TemplateMockService {

    get(templateId: number): Observable<Template> {
        return of(new Template(getData))
    }

    // template add 1 "title" "short" "long" 80 "SALE" "PARTICL" 5 5 5 "Pasdfdfd"
    add(title: string,
        shortDescr: string,
        longDescr: string,
        categoryIdOrName: number | string,
        paymentType: string, // TODO: enum
        currency: string, // TODO: enum
        basePrice: number,
        domesticShippingPrice: number,
        internationalShippingPrice: number,
        paymentAddress?: string // TODO: class
    ) {

        return of(addData);
    }

    search(page: number, pageLimit: number, profileId: number, category: string, searchString: string): Observable<Array<Template>> {

        const templates = searchData[page] || [];
        return of(templates.map(t => new Template(t)));
    }

    post(template: Template, marketId: number, expTime: number) {
        // @TODO trigger the listingCache.posting method.

        // this.listingCache.posting(template)
        return of(postData);
    }

    remove(listingTemplateId: number) {
        // trigger the remove state method.
        return of(undefined);
    }

}


