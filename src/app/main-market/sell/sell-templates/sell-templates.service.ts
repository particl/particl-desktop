import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { isBasicObjectType, getValueOrDefault, formatImagePath } from 'app/main-market/shared/utils';
import { RespListingTemplate, BasicLinkedTemplate } from '../../shared/market.models';
import { BaseTemplateOverview, MarketTemplateOverview } from './sell-templates.models';


@Injectable()
export class SellTemplatesService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store
  ) {}


  fetchSavedTemplates(): Observable<BaseTemplateOverview[]> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    return this._rpc.call('template', ['search', 0, 1000000, 'DESC', 'created_at', profileId]).pipe(
      map((resp: RespListingTemplate[]) => {
        return this.buildBaseListings(resp);
      })
    );
  }


  private isArray(obj: any): boolean {
    return Array.isArray(obj);
  }


  private buildBaseListings(templateList: RespListingTemplate[]): BaseTemplateOverview[] {
    const baseTemplates: BaseTemplateOverview[] = [];
    const settings = this._store.selectSnapshot(MarketState.settings);

    const marketTemplMap: Map<number, RespListingTemplate> = new Map();
    const baseTemplList: RespListingTemplate[] = [];

    const now = Date.now();

    templateList.forEach(templ => {
      if (isBasicObjectType(templ) && (+templ.id > 0)) {
        if (+templ.parentListingItemTemplateId > 0) {
          // is market template
          marketTemplMap.set(+templ.id, templ);
        } else {
          // is base template
          baseTemplList.push(templ);
        }
      }
    });

    baseTemplList.forEach(srcBaseTempl => {
      // process base templates
      const baseOverview = this.buildDefaultBaseTemplateOverviewItem(srcBaseTempl, settings.port);
      if (baseOverview.id > 0) {

        // process the market templates stored on the baseTemplate
        if (this.isArray(srcBaseTempl.ChildListingItemTemplates)) {

          // base template children indicate a market template for a specific market
          srcBaseTempl.ChildListingItemTemplates.forEach(srcMarketTempl => {
            let marketTempls: RespListingTemplate[] = [];

            if (isBasicObjectType(srcMarketTempl) && (+srcMarketTempl.id > 0) && marketTemplMap.get(+srcMarketTempl.id)) {
              const rootMarketTempl = marketTemplMap.get(+srcMarketTempl.id);
              marketTempls.push(rootMarketTempl);
              // get all child templates for this particular market template (children may be nested multiple levels deep)
              marketTempls.push(...this.extractChildrenMarketTemplates(rootMarketTempl.ChildListingItemTemplates, marketTemplMap));
            }

            if (marketTempls.length > 0) {
              marketTempls = marketTempls.filter(mt => +mt.updatedAt > 0).sort((a, b) => +b.updatedAt - +a.updatedAt);

              if (marketTempls[0] && (+marketTempls[0].updatedAt > baseOverview.updatedLast)) {
                baseOverview.updatedLast = marketTempls[0].updatedAt;
              }

              let lastExpiringListing = 0;
              let listingCount = 0;

              // TODO: UPDATE THE BASE TEMPLATE 'marketTemplate' "count...." values
              marketTempls.forEach(mt => {
                if (mt && this.isArray(mt.ListingItems)) {
                  mt.ListingItems.forEach(li => {
                    if (isBasicObjectType(li) && (+li.expiredAt > 0)) {

                      if ((+li.expiredAt > lastExpiringListing)) {
                        lastExpiringListing = +li.expiredAt;
                      }
                    }
                    listingCount += 1;
                  });
                }
              });

              let foundMT = marketTempls.find(mt => mt.hash === null);

              if (!foundMT) {
                foundMT = marketTempls[0];
              }

              const marketOverview = this.buildDefaultMarketTemplate(foundMT);

              if (marketOverview.id > 0) {
                marketOverview.expires = lastExpiringListing;
                marketOverview.listingsCount = listingCount;

                if (marketOverview.expires > now) {
                  baseOverview.marketTemplates.countActiveMarkets += 1;
                }

                baseOverview.marketTemplates.countAllListings += listingCount;
                baseOverview.marketTemplates.templates.push(marketOverview);
              }
            }
          });
        }

        baseTemplates.push(baseOverview);
      }
    });

    return baseTemplates;
  }


  private buildDefaultBaseTemplateOverviewItem(src: RespListingTemplate, marketPort: number): BaseTemplateOverview {
    const newItem: BaseTemplateOverview = {
      id: 0,
      title: '',
      summary: '',
      updatedLast: 0,
      created: 0,
      images: [],
      basePrice: { whole: '', sep: '', fraction: ''},
      sourceLocation: '',
      shippingPriceLocal: { whole: '', sep: '', fraction: ''},
      shippingPriceIntl: { whole: '', sep: '', fraction: ''},
      marketTemplates: {
        templates: [],
        countActiveMarkets: 0,
        countAllListings: 0
      },
      actions: {
        clone: false,
        edit: false,
        publish: false,
        delete: false,
      }
    };

    if (!isBasicObjectType(src) || (+src.parentListingItemTemplateId > 0) || (getValueOrDefault(src.market, 'string', '').length > 0)) {
      return newItem;
    }

    newItem.id = getValueOrDefault(src.id, 'number', newItem.id);

    if (isBasicObjectType(src.ItemInformation)) {
      newItem.title = getValueOrDefault(src.ItemInformation.title, 'string', newItem.title);
      newItem.summary = getValueOrDefault(src.ItemInformation.shortDescription, 'string', newItem.summary);

      if (this.isArray(src.ItemInformation.ItemImages)) {
        src.ItemInformation.ItemImages.sort(
          (a, b) => !!a.featured ? -1 : 0
        ).forEach(img => {
          if (this.isArray(img.ItemImageDatas)) {
            const foundSize = img.ItemImageDatas.find(datas => datas.imageVersion === 'THUMBNAIL');
            if (foundSize) {
              const imgPath = getValueOrDefault(foundSize.dataId, 'string', '') === '' ? '' : formatImagePath(foundSize.dataId, marketPort);
              if (imgPath.length) {
                newItem.images.push(imgPath);
              }
            }
          }
        });
      }

      if (isBasicObjectType(src.ItemInformation.ItemLocation)) {
        newItem.sourceLocation = getValueOrDefault(src.ItemInformation.ItemLocation.country, 'string', newItem.sourceLocation);
      }
    }

    if (newItem.images.length === 0) {
      newItem.images.push('./assets/images/placeholder_4-3.jpg');
    }

    if (+src.createdAt > 0) {
      newItem.created = +src.createdAt;
    }

    if (+src.updatedAt > 0) {
      newItem.updatedLast = +src.updatedAt;
    }


    if (isBasicObjectType(src.PaymentInformation) && isBasicObjectType(src.PaymentInformation.ItemPrice)) {
      const basePrice = new PartoshiAmount(src.PaymentInformation.ItemPrice.basePrice, true);
      newItem.basePrice.whole = basePrice.particlStringInteger();
      newItem.basePrice.sep = basePrice.particlStringSep();
      newItem.basePrice.fraction = basePrice.particlStringFraction();

      if (isBasicObjectType(src.PaymentInformation.ItemPrice.ShippingPrice)) {
        const localShip = new PartoshiAmount(src.PaymentInformation.ItemPrice.ShippingPrice.domestic, true);
        newItem.shippingPriceLocal.whole = localShip.particlStringInteger();
        newItem.shippingPriceLocal.sep = localShip.particlStringSep();
        newItem.shippingPriceLocal.fraction = localShip.particlStringFraction();

        const intlShip = new PartoshiAmount(src.PaymentInformation.ItemPrice.ShippingPrice.international, true);
        newItem.shippingPriceIntl.whole = intlShip.particlStringInteger();
        newItem.shippingPriceIntl.sep = intlShip.particlStringSep();
        newItem.shippingPriceIntl.fraction = intlShip.particlStringFraction();
      }
    }

    return newItem;
  }


  private extractChildrenMarketTemplates(
    linkedTemplates: BasicLinkedTemplate[], templateMap: Map<number, RespListingTemplate>
  ): RespListingTemplate[] {

    const respItems = [];

    if (this.isArray(linkedTemplates)) {
      linkedTemplates.forEach(lt => {
        if (isBasicObjectType(lt) && (+lt.id > 0) && (templateMap.get(+lt.id))) {
          const mpTemplate = templateMap.get(+lt.id);
          respItems.push(mpTemplate);
          respItems.push(...this.extractChildrenMarketTemplates(mpTemplate.ChildListingItemTemplates, templateMap));
        }
      });
    }

    return respItems;
  }


  private buildDefaultMarketTemplate(src: RespListingTemplate): MarketTemplateOverview {
    const newItem: MarketTemplateOverview = {
      id: 0,
      title: '',
      category: '',
      marketKey: '',
      basePrice: '',
      status: null,
      listingsCount: 0,
      hasHash: false,
      expires: 0,
      actions: {
        clone: false,
        edit: false,
        delete: false,
        publish: false,
      }
    };

    if (!isBasicObjectType(src) || !(+src.parentListingItemTemplateId > 0) || (getValueOrDefault(src.market, 'string', '').length === 0)) {
      return newItem;
    }

    newItem.id = getValueOrDefault(src.id, 'number', newItem.id);
    newItem.marketKey = getValueOrDefault(src.market, 'string', newItem.marketKey);

    newItem.hasHash = getValueOrDefault(src.hash, 'string', '').length === 0;

    if (isBasicObjectType(src.ItemInformation)) {
      newItem.title = getValueOrDefault(src.ItemInformation.title, 'string', newItem.title);
    }

    if (isBasicObjectType(src.PaymentInformation) && isBasicObjectType(src.PaymentInformation.ItemPrice)) {
      const basePrice = new PartoshiAmount(src.PaymentInformation.ItemPrice.basePrice, true);
      newItem.basePrice = basePrice.particlsString();
    }

    return newItem;
  }

}
