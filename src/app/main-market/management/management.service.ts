import { Injectable } from '@angular/core';
import { Observable,  } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { isBasicObjectType, getValueOrDefault, parseImagePath } from '../shared/utils';
import { MARKET_REGION, MarketType, RespMarketListMarketItem } from '../shared/market.models';
import { AvailableMarket } from './management.models';


enum TextContent {
  LABEL_REGION_ALL = 'All regions',
  LABEL_REGION_WORLDWIDE = 'Worldwide / Global',
  LABEL_REGION_NORTH_AMERICA = 'North Americas',
  LABEL_REGION_SOUTH_AMERICA = 'Cerntral & Southern America',
  LABEL_REGION_EUROPE = 'Europe',
  LABEL_REGION_MIDDLE_EAST_AFRICA = 'WMiddle East & Africa',
  LABEL_REGION_ASIA_PACIFIC = 'Asia Pacific'
}


@Injectable()
export class MarketManagementService {


  private marketRegionsMap: Map<MARKET_REGION | '', string> = new Map();


  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
  ) {
    this.marketRegionsMap.set('', TextContent.LABEL_REGION_ALL);
    this.marketRegionsMap.set(MARKET_REGION.WORLDWIDE, TextContent.LABEL_REGION_WORLDWIDE);
    this.marketRegionsMap.set(MARKET_REGION.NORTH_AMERICA, TextContent.LABEL_REGION_NORTH_AMERICA);
    this.marketRegionsMap.set(MARKET_REGION.SOUTH_AMERICA, TextContent.LABEL_REGION_SOUTH_AMERICA);
    this.marketRegionsMap.set(MARKET_REGION.EUROPE, TextContent.LABEL_REGION_EUROPE);
    this.marketRegionsMap.set(MARKET_REGION.MIDDLE_EAST_AFRICA, TextContent.LABEL_REGION_MIDDLE_EAST_AFRICA);
    this.marketRegionsMap.set(MARKET_REGION.ASIA_PACIFIC, TextContent.LABEL_REGION_ASIA_PACIFIC);
  }


  getMarketRegions(): {value: string, label: string}[] {
    const resp: {value: string, label: string}[] = [];
    this.marketRegionsMap.forEach((val, key) => resp.push({value: key, label: val}));
    return resp;
  }


  searchAvailableMarkets(
    // pageNum: number,
    // pageQuantity: number,
    // search: string = null,
    // marketRegion: MARKET_REGION = null,
    // marketType?: MarketType
  ): Observable<AvailableMarket[]> {
    return this._rpc.call('market', ['list']).pipe(
    // this._rpc.call('market', ['search', pageNum, pageQuantity, 'DESC', 'created_at', search, marketRegion, marketType || null]).pipe(
      map((markets: RespMarketListMarketItem[]) => {

        const marketDefaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);
        const resp: AvailableMarket[] = [];

        if (Array.isArray(markets)) {
          markets.forEach(market => {
            const newMarketItem: AvailableMarket = {
              id: 0,
              name: '',
              summary: '',
              image: marketDefaultConfig.imagePath,
              region: MARKET_REGION.WORLDWIDE,
              receiveKey: '',
              publishKey: null,
            };
            if (
              !(+market.profileId > 0) &&
              !isBasicObjectType(market.Profile) &&
              isBasicObjectType(market) &&
              (getValueOrDefault(market.receiveKey, 'string', '').length > 0)
            ) {
              newMarketItem.id = +market.id > 0 ? +market.id : newMarketItem.id;
              newMarketItem.name = getValueOrDefault(market.name, 'string', newMarketItem.name);
              newMarketItem.summary = getValueOrDefault(market.description, 'string', newMarketItem.summary);

              const regionLabel = getValueOrDefault(market.region, 'string', newMarketItem.region);
              newMarketItem.region = this.marketRegionsMap.get(regionLabel as MARKET_REGION) || regionLabel;
              newMarketItem.receiveKey = getValueOrDefault(market.receiveKey, 'string', market.receiveKey);
              newMarketItem.publishKey = getValueOrDefault(market.publishKey, 'string', market.publishKey);

              if (isBasicObjectType(market.Image)) {
                if (
                  Array.isArray(market.Image.ImageDatas) &&
                  (market.Image.ImageDatas.length > 0) &&
                  isBasicObjectType(market.Image.ImageDatas[0])
                ) {
                  newMarketItem.image = parseImagePath(market.Image, market.Image.ImageDatas[0].imageVersion, marketDefaultConfig.url);
                }
              }

              if (newMarketItem.id > 0) {
                resp.push(newMarketItem);
              }
            }
          });
        }

        return resp;
      })
    );
  }

}
