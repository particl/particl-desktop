import { Injectable } from '@angular/core';
import { Observable, of, iif, defer, throwError } from 'rxjs';
import { map, mapTo, catchError, concatMap, last, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { Particl } from 'app/networks/networks.module';
import { MarketState } from '../store/market.state';
import { MarketUserActions } from '../store/market.actions';

import { BackendService } from 'app/core/services/backend.service';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { ParticlRpcService } from 'app/networks/networks.module';

import { isBasicObjectType, getValueOrDefault, parseImagePath, parseMarketResponseItem, openMarketAddresses } from '../shared/utils';
import { MARKET_REGION, RespMarketListMarketItem, RespItemPost, MarketType, RespVoteGet, IMAGE_SEND_TYPE, DefaultOpenMarketDetails } from '../shared/market.models';
import { CategoryItem, Market } from '../services/data/data.models';
import { AvailableMarket, CreateMarketRequest, JoinedMarket, MarketGovernanceInfo } from './management.models';
import { DefaultMarketConfig } from '../store/market.models';
import { ChainType, RPCResponses } from 'app/networks/particl/particl.models';


enum TextContent {
  LABEL_REGION_ALL = 'All regions',
  LABEL_REGION_WORLDWIDE = 'Worldwide / Global',
  LABEL_REGION_NORTH_AMERICA = 'North Americas',
  LABEL_REGION_SOUTH_AMERICA = 'Central & Southern America',
  LABEL_REGION_EUROPE = 'Europe',
  LABEL_REGION_MIDDLE_EAST_AFRICA = 'Middle East & Africa',
  LABEL_REGION_ASIA_PACIFIC = 'Asia Pacific',

  DEFAULT_MARKET_SUMMARY = 'A default market that is publicly known and available (a good first starting market to join).'
}


@Injectable()
export class MarketManagementService {

  static readonly MARKET_INVITE_SEP: string = ':::';

  readonly MAX_MARKET_NAME: number = 50;
  readonly MAX_MARKET_SUMMARY: number = 150;


  private marketRegionsMap: Map<MARKET_REGION | '', string> = new Map();
  private openAddresses: Map<string, DefaultOpenMarketDetails> = new Map();
  private readonly marketDefaultImage: string;
  private readonly IMAGE_SCALING_FACTOR: number = 0.6;
  private readonly IMAGE_QUALITY_FACTOR: number = 0.9;
  private readonly IMAGE_ITERATIONS: number = 50;


  constructor(
    private _rpc: MarketRpcService,
    private _daemonRpc: ParticlRpcService,
    private _store: Store,
    private _backend: BackendService,
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
    for (const addr of openMarketAddresses()) { this.openAddresses.set(addr.address, addr); }
  }


  get IMAGE_MAX_SIZE(): number {
    const defaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);
    const marketSettings = this._store.selectSnapshot(MarketState.settings);
    return marketSettings.usePaidMsgForImages ? defaultConfig.imageMaxSizePaid : defaultConfig.imageMaxSizeFree;
  }

  get DEFAULT_MARKETS(): DefaultOpenMarketDetails[] {
    return [...this.openAddresses.values()];
  }


  getMarketRegions(): {value: string, label: string}[] {
    const resp: {value: string, label: string}[] = [];
    this.marketRegionsMap.forEach((val, key) => resp.push({value: key, label: val}));
    return resp;
  }


  getDefaultMarkets(): AvailableMarket[] {
    const resp: AvailableMarket[] = [];

    const marketDefaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);
    const isTestnet = this._store.selectSnapshot<ChainType>(Particl.State.Blockchain.chainType()) === 'test';
    const defaultMarkets: Map<string, DefaultOpenMarketDetails> = new Map();
    openMarketAddresses().filter(oma => oma.isTest === isTestnet).forEach(om => {
      defaultMarkets.set(om.address, om);
    });

    this._store.selectSnapshot(MarketState.currentProfileIdentities).forEach(id => id.markets.forEach(m => {
      if (defaultMarkets.has(m.receiveAddress)) {
        defaultMarkets.delete(m.receiveAddress);
      }
    }));

    for (const defaultMarket of defaultMarkets.values()) {
      resp.push(this.buildDefaultMarket(defaultMarket, marketDefaultConfig));
    }

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

        const resp: AvailableMarket[] = [];

        const marketDefaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);

        if (Array.isArray(markets)) {
          markets.forEach(market => {
            const newMarketItem = this.buildAvailableMarket(market, marketDefaultConfig);
              if (newMarketItem.id > 0) {
                resp.push(newMarketItem);
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
              type: market.marketType,
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
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    const postParams = [
      'post',
      marketId,
      identityId,
      durationDays,
      true,
      null,
      usePaidImageMsg,
      (usingAnonFees ? 'anon' : 'part'),
      12,
    ];

    return this._rpc.call('market', postParams).pipe(
      concatMap((resp: RespItemPost) => {
        if (isBasicObjectType(resp) && (+resp.fee > 0)) {
          return of(+resp.fee);
        }
        return throwError(typeof resp.error === 'string' && resp.error.includes('utxos') ? 'Insufficient utxos' : 'Invalid Estimation');
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
      identityId,
      durationDays,
      false,
      null,
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
    return this._backend.sendAndWait<string>('apps:market:services:key-generator', 'PUBLIC', privateKey);
  }


  forceSmsgRescan(): Observable<any> {
    return this._daemonRpc.call<RPCResponses.SmsgScanBuckets>('smsgscanbuckets').pipe(
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

    newItem.name = this.openAddresses.has(newItem.receiveAddress) ?
      this.openAddresses.get(newItem.receiveAddress).name :
      getValueOrDefault(src.name, 'string', newItem.name);

    return newItem;
  }


  private buildAvailableMarket(market: RespMarketListMarketItem, marketDefaultConfig: DefaultMarketConfig): AvailableMarket {
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
      isDefaultMarket: false,
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
    }

    return newMarketItem;
  }


  private buildDefaultMarket(details: DefaultOpenMarketDetails, marketDefaultConfig: DefaultMarketConfig): AvailableMarket {
    const newMarketItem: AvailableMarket = {
      id: 0,
      name: details.name,
      summary: TextContent.DEFAULT_MARKET_SUMMARY,
      // tslint:disable
      image: 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAkACQAAD/4QDaRXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAAYgEbAAUAAAABAAAAagEoAAMAAAABAAIAAAExAAIAAAAPAAAAcgEyAAIAAAAUAAAAgodpAAQAAAABAAAAlgAAAAAAAACQAAAAAQAAAJAAAAABUGl4ZWxtYXRvciAzLjkAADIwMjA6MDk6MDcgMTQ6MDk6ODYAAAOShgAHAAAAEgAAAMCgAgAEAAAAAQAAAZCgAwAEAAAAAQAAAZUAAAAAQVNDSUkAAABTY3JlZW5zaG90/+EJ9Gh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wOkNyZWF0b3JUb29sPSJQaXhlbG1hdG9yIDMuOSIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMDktMDdUMTQ6MDk6ODYiPiA8ZGM6c3ViamVjdD4gPHJkZjpCYWcvPiA8L2RjOnN1YmplY3Q+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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e8mADvjIHTiqlMDrvBV2ltqphkOBMu0Z9R0r1x0WRCjgFWGCD6V86qzIQynBHQjtXWWnjPVrZBHJtmA7t1/OkB0PifQtLstLkuraEJJuXke9Z/gL/j7uP9wfzrK1XxXd6raNZyRIisQcj2rN0fWbjRpHktlVjIMHdTsB6/4h/wCQJd/9czXjWk6g+l38V4vIU/MPVT1rcvPGGoXtrJaSxoFlXaSOtcj0pID6GtbqC9gS5t2Do4yCKoXeg6TfSedcwKz92HBP1xXjmm6xqGlPutHwD1Q8qfwrrovH0wXE1qCfUNQB6HbWdtZxCG2jWNPQCvOfGkOkQsogULdsctt6Y9x6mqt7431G4QpbIsAPccmuNkkklcyysWZjkk8k0WA9e8Ef8gQf9dHqn48/5B0P/XT+lcdpXii90m0+yQIjKGLZbrzUer+I7vWIFguEVQrbhtoAwUd43EkZKsOhFaZ1vUSmzzPxwM1lUUyHCL3Q52Z2LOSSepNNoooLCiiigAooooAKKKKACiiigD//0+GHSlpB0oqiQpaSkoAWkoooAKKKKACiiigAooooA9e8Ef8AIDH/AF1eqvjv/kHQ/wDXT+leYx3VzEuyKV0X0ViB+lElxcTDbNK7gc4ZiR+tFhkNFFFAgooooAKKKKACiiigYUUUUAFFFFACUtFFABRRRQAUlLRQA2ilNJQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/1OGHSlpB0oqiQNJS0lABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAwooooAKKKKACiiigAooooAKKKKACiiigAooooAKQ0UlABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/9Xhh0paQdKWqJG0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUDCiiigAooooAKKKKACiiigAooooAKSlpOtAC02nU2gAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//9bhR0pc0g6UVRIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUDCiiigAooooAKKKKACiiigAooooAKSlooASkoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//X4UdKKB0oqiQooooAKKKKACiiigAooooAKKKKACiiigYUUUUAFFFFABRRRQAUUUUAFFFFABRRSZoAWkzRmkoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/0OC3GjcaSimIXcaNxpKKAF3GjcaSigBdxo3GkpKAHbjRuNNooAduNG402igB240bjTaKAHbjSbjSUlADtxo3Gm0UAO3GjcabRQA7caNxptFADtxo3Gm0UAO3GjcabRQA7caNxptFADtxo3Gm0UAO3GjcabRQA7caNxptFAC7jS7jTaKAFzUqKGGTUNTx/doAdsFGwU+igBmwUbBT6KAGbBRsFPooAZsFGwU+igBnlijy1p9FADPLWjy1p9FAH//Z'
      // tslint:enable
      , region: {
        value: MARKET_REGION.WORLDWIDE,
        label: this.marketRegionsMap.get(MARKET_REGION.WORLDWIDE)
      },
      receiveKey: details.key,
      publishKey: details.key,
      marketType: details.marketType,
      expires: 0,
      isDefaultMarket: true,
    };

    return newMarketItem;
  }

}
