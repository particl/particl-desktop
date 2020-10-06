import { Injectable } from '@angular/core';
import { Observable, of, iif, defer, throwError } from 'rxjs';
import { map, mapTo, catchError, concatMap, last } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { isBasicObjectType, getValueOrDefault, parseImagePath } from '../shared/utils';
import { MARKET_REGION, RespMarketListMarketItem, RespItemPost, MarketType, RespVoteGet } from '../shared/market.models';
import { AvailableMarket, CreateMarketRequest, JoinedMarket, MarketGovernanceInfo } from './management.models';


enum TextContent {
  LABEL_REGION_ALL = 'All regions',
  LABEL_REGION_WORLDWIDE = 'Worldwide / Global',
  LABEL_REGION_NORTH_AMERICA = 'North Americas',
  LABEL_REGION_SOUTH_AMERICA = 'Cerntral & Southern America',
  LABEL_REGION_EUROPE = 'Europe',
  LABEL_REGION_MIDDLE_EAST_AFRICA = 'Middle East & Africa',
  LABEL_REGION_ASIA_PACIFIC = 'Asia Pacific'
}


@Injectable()
export class MarketManagementService {

  readonly MAX_MARKET_NAME: number = 50;
  readonly MAX_MARKET_SUMMARY: number = 150;


  private marketRegionsMap: Map<MARKET_REGION | '', string> = new Map();
  private readonly marketDefaultImage: string;


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

    const defaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);

    this.marketDefaultImage = defaultConfig.imagePath;
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
              region: {
                value: MARKET_REGION.WORLDWIDE,
                label: ''
              },
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

              const regionMarket = getValueOrDefault(market.region, 'string', MARKET_REGION.WORLDWIDE);
              newMarketItem.region.label = this.marketRegionsMap.get(regionMarket);
              newMarketItem.region.value = regionMarket;
              newMarketItem.receiveKey = getValueOrDefault(market.receiveKey, 'string', newMarketItem.receiveKey);
              newMarketItem.publishKey = getValueOrDefault(market.publishKey, 'string', newMarketItem.publishKey);

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


  searchJoinedMarkets(): Observable<JoinedMarket[]> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    return this._rpc.call('market', ['list', profileId]).pipe(
      map((markets: RespMarketListMarketItem[]) => {
        const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
        return Array.isArray(markets)
        ? markets.filter(m =>
            isBasicObjectType(m) && +m.identityId === identityId
          ).map(m =>
            this.buildJoinedMarket(m, marketUrl)
          )
        : [];
      })
    );
  }


  joinAvailableMarket(marketId: number): Observable<boolean> {
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    return this._rpc.call('market', ['join', profileId, marketId, identityId]).pipe(
      mapTo(true),
    );
  }


  leaveMarket(marketId: number): Observable<void> {
    return this._rpc.call('market', ['remove', marketId]);
  }


  createMarket(details: CreateMarketRequest): Observable<JoinedMarket> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;

    const params = [
      'add',
      profileId,
      details.name,
      details.marketType,
      getValueOrDefault(details.receiveKey, 'string', '').length > 0 ? details.receiveKey : null,
      getValueOrDefault(details.publishKey, 'string', '').length > 0 ? details.publishKey : null,
      identityId
    ];

    if (getValueOrDefault(details.description, 'string', '').length > 0) {
      params.push(details.description);
    }

    if (details.region) {
      params.push(details.region);
    }

    return this._rpc.call('market', params).pipe(
      concatMap(market => iif(

        () => isBasicObjectType(details.image),

        defer(() => {
          const imageParts = details.image.data.split(',');
          const imgData = imageParts.length === 2 ? imageParts[1] : details.image.data;

          return this._rpc.call('image', ['add', 'market', +market.id, details.image.type, imgData]).pipe(
            concatMap(() => this._rpc.call('market', ['get', market.id, true])),
            catchError(() => of(market))
          );
        }),

        defer(() => of(market))
      )),
      last(),
      map((market: RespMarketListMarketItem) => {
        const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
        return this.buildJoinedMarket(market, marketUrl);
      })
    );
  }


  estimateMarketPromotionFee(marketId: number, durationDays: number): Observable<number> {
    return this._rpc.call('market', ['post', marketId, durationDays, true]).pipe(
      map((resp: RespItemPost) => {
        if (isBasicObjectType(resp) && (+resp.fee > 0)) {
          return +resp.fee;
        }
        throwError('Invalid Estimation');
      })
    );
  }


  promoteMarket(marketId: number, durationDays: number): Observable<boolean> {
    return this._rpc.call('market', ['post', marketId, durationDays, false]).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }


  fetchMarketGovernanceDetails(marketId: number): Observable<MarketGovernanceInfo> {
    // we're not retriving image data, so no need for marketUrl info (which is primarily used for the image processing)
    return this._rpc.call('market', ['get', marketId, false]).pipe(
      map((resp: RespMarketListMarketItem) => {
        const newItem: MarketGovernanceInfo = {
          marketId,
          proposalHash: '',
          voteCastId: null,
          voteKeepId: null,
          voteRemoveId: null
        };

        if (isBasicObjectType(resp) && (+resp.id > 0) && (resp.id === marketId)) {
          if (isBasicObjectType(resp.FlaggedItem) && isBasicObjectType(resp.FlaggedItem.Proposal)) {
            newItem.proposalHash = getValueOrDefault(resp.FlaggedItem.Proposal.hash, 'string', newItem.proposalHash);
          }
        }

        return newItem;
      }),
      concatMap((govInfo) => iif(
        () => govInfo.proposalHash.length > 0,

        // get the vote related info
        defer(() => this._rpc.call('vote', ['get', govInfo.marketId, govInfo.proposalHash]).pipe(
          map((voteResp: RespVoteGet) => {
            if (isBasicObjectType(voteResp)) {
              if (isBasicObjectType(voteResp.votedProposalOption) && (+voteResp.votedProposalOption.optionId >= 0)) {
                govInfo.voteCastId = +voteResp.votedProposalOption.optionId;
              }

              if (Array.isArray(voteResp.proposalOptions)) {
                voteResp.proposalOptions.forEach(vo => {
                  if (isBasicObjectType(vo) && (typeof vo.description === 'string') && (+vo.optionId >= 0)) {
                    if (vo.description === 'KEEP') {
                      govInfo.voteKeepId = vo.optionId;
                    } else if (vo.description === 'REMOVE') {
                      govInfo.voteRemoveId = vo.optionId;
                    }
                  }
                });
              }
            }
            return govInfo;
          })
        )),

        // just return the governance info as is then
        defer(() => of(govInfo))
      ))
    );
  }


  flagMarket(marketId: number): Observable<any> {
    return this._rpc.call('market', ['flag', marketId]);
  }


  voteForMarket(marketId: number, proposalHash: string, optionId: number): Observable<any> {
    return this._rpc.call('vote', ['post', marketId, proposalHash, optionId]);
  }


  private buildJoinedMarket(src: RespMarketListMarketItem, marketUrl: string): JoinedMarket {
    const newItem: JoinedMarket = {
      id: 0,
      name: '',
      summary: '',
      image: this.marketDefaultImage,
      region: {
        label: '',
        value: MARKET_REGION.WORLDWIDE
      },
      marketType: MarketType.MARKETPLACE,
      receiveKey: '',
      publishKey: '',
      receiveAddress: '',
      publishAddress: '',
      isFlagged: false
    };

    if (!isBasicObjectType(src)) {
      return newItem;
    }

    newItem.id = +src.id > 0 ? +src.id : newItem.id;
    newItem.name = getValueOrDefault(src.name, 'string', newItem.name);
    newItem.summary = getValueOrDefault(src.description, 'string', newItem.summary);

    if (isBasicObjectType(src.Image)) {
      if (
        Array.isArray(src.Image.ImageDatas) &&
        (src.Image.ImageDatas.length > 0) &&
        isBasicObjectType(src.Image.ImageDatas[0])
      ) {
        newItem.image = parseImagePath(src.Image, src.Image.ImageDatas[0].imageVersion, marketUrl);
      }
    }

    newItem.marketType = getValueOrDefault(src.type, 'string', newItem.marketType);

    const regionMarket = getValueOrDefault(src.region, 'string', MARKET_REGION.WORLDWIDE);
    newItem.region.label = this.marketRegionsMap.get(regionMarket);
    newItem.region.value = regionMarket;
    newItem.receiveKey = getValueOrDefault(src.receiveKey, 'string', newItem.receiveKey);
    newItem.publishKey = getValueOrDefault(src.publishKey, 'string', newItem.publishKey);
    newItem.receiveAddress = getValueOrDefault(src.receiveAddress, 'string', newItem.receiveAddress);
    newItem.publishAddress = getValueOrDefault(src.publishAddress, 'string', newItem.publishAddress);
    newItem.isFlagged = isBasicObjectType(src.FlaggedItem) && (+src.FlaggedItem.id > 0);

    return newItem;
  }

}
