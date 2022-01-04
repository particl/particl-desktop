import { Injectable } from '@angular/core';
import { Observable, of, iif, defer, throwError } from 'rxjs';
import { map, mapTo, catchError, concatMap, last, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { MarketUserActions } from '../store/market.actions';

import { IpcService } from 'app/core/services/ipc.service';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { isBasicObjectType, getValueOrDefault, parseImagePath, parseMarketResponseItem } from '../shared/utils';
import { MARKET_REGION, RespMarketListMarketItem, RespItemPost, MarketType, RespVoteGet, IMAGE_SEND_TYPE } from '../shared/market.models';
import { CategoryItem, Market } from '../services/data/data.models';
import { AvailableMarket, CreateMarketRequest, JoinedMarket, MarketGovernanceInfo } from './management.models';

import * as marketConfig from '../../../../modules/market/config.js';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';


enum TextContent {
  LABEL_REGION_ALL = 'All regions',
  LABEL_REGION_WORLDWIDE = 'Worldwide / Global',
  LABEL_REGION_NORTH_AMERICA = 'North Americas',
  LABEL_REGION_SOUTH_AMERICA = 'Central & Southern America',
  LABEL_REGION_EUROPE = 'Europe',
  LABEL_REGION_MIDDLE_EAST_AFRICA = 'Middle East & Africa',
  LABEL_REGION_ASIA_PACIFIC = 'Asia Pacific',

  OPEN_MARKET_NAME = 'Open Market'
}


@Injectable()
export class MarketManagementService {

  readonly MAX_MARKET_NAME: number = 50;
  readonly MAX_MARKET_SUMMARY: number = 150;


  private marketRegionsMap: Map<MARKET_REGION | '', string> = new Map();
  private openMarketAddresses: string[];
  private readonly marketDefaultImage: string;
  private readonly IMAGE_SCALING_FACTOR: number = 0.6;
  private readonly IMAGE_QUALITY_FACTOR: number = 0.9;
  private readonly IMAGE_ITERATIONS: number = 50;


  constructor(
    private _rpc: MarketRpcService,
    private _daemonRpc: MainRpcService,
    private _store: Store,
    private _ipc: IpcService,
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

    if (isBasicObjectType(marketConfig.addressesOpenMarketplace)) {
      this.openMarketAddresses = Object.keys(marketConfig.addressesOpenMarketplace);
    }
  }


  get IMAGE_MAX_SIZE(): number {
    const defaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);
    const marketSettings = this._store.selectSnapshot(MarketState.settings);
    return marketSettings.usePaidMsgForImages ? defaultConfig.imageMaxSizePaid : defaultConfig.imageMaxSizeFree;
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
              publishKey: '',
              marketType: MarketType.STOREFRONT,
              expires: 0,
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
              newMarketItem.marketType = getValueOrDefault(market.type, 'string', newMarketItem.marketType);
              const exp = +getValueOrDefault(market.expiredAt, 'number', newMarketItem.expires);
              newMarketItem.expires = exp > 0 ? exp : newMarketItem.expires;

              if (isBasicObjectType(market.Image)) {
                if (
                  Array.isArray(market.Image.ImageDatas) &&
                  (market.Image.ImageDatas.length > 0) &&
                  isBasicObjectType(market.Image.ImageDatas[0])
                ) {
                  newMarketItem.image = parseImagePath(
                    market.Image, market.Image.ImageDatas[0].imageVersion, marketDefaultConfig.url
                  ) || newMarketItem.image;
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


  joinAvailableMarket(market: AvailableMarket): Observable<boolean> {
    return defer(() => {

      if (!isBasicObjectType(market)) {
        throwError(new Error('INVALID_MARKET'));
        return;
      }

      const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
      const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;

      return this._rpc.call('market', ['join', profileId, market.id, identityId]).pipe(
        concatMap((joinedMarket: RespMarketListMarketItem) => {
          if (isBasicObjectType(joinedMarket) && +joinedMarket.id > 0) {
            const idMarket: Market = {
              id: joinedMarket.id,
              identityId: identityId,
              image: market.image,
              name: market.name,
              publishAddress: market.publishKey,
              receiveAddress: market.receiveKey,
              type: market.marketType
            };
            return this._store.dispatch([
              new MarketUserActions.AddIdentityMarket(idMarket),
              new MarketUserActions.SetSetting('profile.marketsLastAdded', Date.now()),
            ]).pipe(mapTo(true));
          }
          return of(false);
        })
      );
    });

  }


  leaveMarket(marketId: number): Observable<void> {
    return this._rpc.call('market', ['remove', marketId]).pipe(
      tap(() => {
        const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
        this._store.dispatch(new MarketUserActions.RemoveIdentityMarket(identityId, marketId));
      })
    );
  }


  createMarket(details: CreateMarketRequest): Observable<JoinedMarket> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    const usePaidImageMsg = this._store.selectSnapshot(MarketState.settings).usePaidMsgForImages;

    const receiveKey = getValueOrDefault(details.receiveKey, 'string', '').length > 0 ? details.receiveKey : null;
    const publishKey = getValueOrDefault(details.publishKey, 'string', '').length > 0 ? details.publishKey : null;
    const params = [
      'add',
      profileId,
      details.name,
      details.marketType,
      receiveKey,
      publishKey,
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

          return this._rpc.call('image', [
            'add',
            'market',
            +market.id,
            details.image.type,
            imgData,
            false,
            false,
            usePaidImageMsg ? IMAGE_SEND_TYPE.PAID : IMAGE_SEND_TYPE.FREE,
            this.IMAGE_SCALING_FACTOR,
            this.IMAGE_QUALITY_FACTOR,
            this.IMAGE_ITERATIONS
          ]).pipe(
            concatMap(() => this._rpc.call('market', ['get', market.id, true])),
            catchError(() => of(market))
          );
        }),

        defer(() => of(market))
      )),
      last(),
      map((market: RespMarketListMarketItem) => {
        const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;

        const idMarket = parseMarketResponseItem(market, marketUrl, this.marketDefaultImage);
        if ((idMarket.id > 0) && (idMarket.identityId > 0)) {
          this._store.dispatch(new MarketUserActions.AddIdentityMarket(idMarket));
        }

        return this.buildJoinedMarket(market, marketUrl);
      }),
      concatMap(response => {
        if (receiveKey || publishKey) {
          return this._store.dispatch(new MarketUserActions.SetSetting('profile.marketsLastAdded', Date.now())).pipe(mapTo(response));
        }
        return of(response);
      })
    );
  }


  estimateMarketPromotionFee(marketId: number, durationDays: number): Observable<number> {
    const marketSettings = this._store.selectSnapshot(MarketState.settings);
    const usingAnonFees = marketSettings.useAnonBalanceForFees;
    const usePaidImageMsg = marketSettings.usePaidMsgForImages;
    const postParams = [
      'post',
      marketId,
      durationDays,
      true,
      null,
      null,
      usePaidImageMsg,
      (usingAnonFees ? 'anon' : 'part'),
      12,
    ];

    return this._rpc.call('market', postParams).pipe(
      map((resp: RespItemPost) => {
        if (isBasicObjectType(resp) && (+resp.fee > 0)) {
          return +resp.fee;
        }
        throwError('Invalid Estimation');
      })
    );
  }


  promoteMarket(marketId: number, durationDays: number): Observable<boolean> {
    const marketSettings = this._store.selectSnapshot(MarketState.settings);
    const usingAnonFees = marketSettings.useAnonBalanceForFees;
    const usePaidImageMsg = marketSettings.usePaidMsgForImages;
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    const postParams = [
      'post',
      marketId,
      durationDays,
      false,
      null,
      identityId,
      usePaidImageMsg,
      (usingAnonFees ? 'anon' : 'part'),
      12,
    ];

    return this._rpc.call('market', postParams).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }


  fetchMarketGovernanceDetails(marketId: number): Observable<MarketGovernanceInfo> {
    // we're not retrieving image data, so no need for marketUrl info (which is primarily used for the image processing)
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
          }),
          // catch the vote get error, because not having a vote throws the error 'No votes found'.
          catchError(() => of(govInfo))
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


  addCategoryToMarket(categoryName: string, parentCategoryId: number, marketId: number): Observable<CategoryItem> {
    return this._rpc.call('category', ['add', marketId, categoryName, '', parentCategoryId]).pipe(
      map(resp => {
        const newCategory: CategoryItem = {
          id: 0,
          name: '',
          children: []
        };

        if (isBasicObjectType(resp)) {
          newCategory.id = +resp.id > 0 ? +resp.id : newCategory.id;
          newCategory.name = getValueOrDefault(resp.name, 'string', newCategory.name);
        }

        return newCategory;
      })
    );
  }


  removeCategory(categoryId: number): Observable<boolean> {
    return this._rpc.call('category', ['remove', categoryId]).pipe(mapTo(true));
  }

  calculatePublicKeyFromPrivate(privateKey: string): Observable<string> {
    return this._ipc.runCommand('market-keygen', null, 'PUBLIC', privateKey);
  }


  forceSmsgRescan(): Observable<any> {
    return this._daemonRpc.call('smsgscanbuckets').pipe(
      concatMap(() => this._store.dispatch(new MarketUserActions.SetSetting('profile.marketsLastAdded', 0)))
    );
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
    newItem.summary = getValueOrDefault(src.description, 'string', newItem.summary);

    if (isBasicObjectType(src.Image)) {
      if (
        Array.isArray(src.Image.ImageDatas) &&
        (src.Image.ImageDatas.length > 0) &&
        isBasicObjectType(src.Image.ImageDatas[0])
      ) {
        newItem.image = parseImagePath(src.Image, src.Image.ImageDatas[0].imageVersion, marketUrl) || newItem.image;
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

    newItem.name = this.openMarketAddresses.includes(newItem.receiveAddress) ? TextContent.OPEN_MARKET_NAME : getValueOrDefault(src.name, 'string', newItem.name);

    return newItem;
  }

}
