import { Component, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GalleryItem, ImageItem } from '@ngx-gallery/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject, timer, iif, defer, of, merge } from 'rxjs';
import { takeUntil, tap, concatMap, finalize, catchError, switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';
import { ListingDetailService } from './listing-detail.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { isBasicObjectType, getValueOrDefault } from '../utils';
import { ListingItemDetail } from './listing-detail.models';
import { MADCT_ESCROW_PERCENTAGE_DEFAULT } from './../market.models';
import { ChatChannelType } from './../../services/chats/chats.models';


type InitialTabSelectionType = 'default' | 'review';


enum TextContent {
  UNSET_VALUE = '<unknown>',
  TIMER_SECONDS_REMAINING = 'Less than a minute',
  FAV_SET_FAILED = 'Setting as favourite failed, please try again shortly',
  FLAG_SET_FAILED = 'Flagging this item failed, please try again shortly',
  VOTE_SET_FAILED = 'Voting failed, please try again shortly',
  CART_ADD_FAILED = 'Something went wrong adding the item to the cart',
  CART_ADD_DUPLICATE = 'This item is already in the cart',
  CART_ADD_SUCCESS = 'Successfully added to cart',
}


interface Actionables {
  cart: boolean;
  governance: boolean;
  fav: boolean;
}


export interface ListingItemDetailInputs {
  listing: ListingItemDetail;
  canReview: boolean;
  displayChat: boolean;
  initTab?: InitialTabSelectionType;
  displayActions: Actionables;
}


@Component({
  templateUrl: './listing-detail-modal.component.html',
  styleUrls: ['./listing-detail-modal.component.scss'],
  providers: [ListingDetailService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailModalComponent implements OnInit, OnDestroy {

  @Output() eventFavouritedItem: EventEmitter<number> = new EventEmitter();
  @Output() eventFlaggedItem: EventEmitter<string> = new EventEmitter();

  readonly EscrowRecommendedDefault: number = MADCT_ESCROW_PERCENTAGE_DEFAULT;
  readonly ChatTopicType: ChatChannelType = ChatChannelType.LISTINGITEM;


  expiryTimer: string = '';
  initialTab: InitialTabSelectionType = 'default';
  canAction: boolean = true;

  readonly displayActions: Actionables = {
    cart: false,
    governance: false,
    fav: false
  };
  readonly showComments: boolean;
  readonly showChatPanel: boolean;

  readonly details: {
    id: number;
    hash: string;
    title: string;
    summary: string;
    description: string;
    images: {
      hasNoImages: boolean;
      images: GalleryItem[];
    };
    price: {
      base: string;
      shipping: {
        local: string;
        intl: string;
        actual: string;
      };
      escrow: {
        local: string;
        intl: string;
        actual: string;
      };
      total: {
        local: string;
        intl: string;
        actual: string;
      };
    };
    escrowRatios: {
      buyer: number;
      seller: number;
      isRecommendedDefault: boolean;
    }
    category: string;
    marketAddress: string;
    seller: string;
    shipping: {
      source: string;
      selectedDestination: string;
      destinations: string[];
      canShip: boolean;
    };
    created: number;
    isOwner: boolean;
    favouriteId: number;
    governance: {
      proposalHash: string;
      voteCast: number;
      voteOptionKeep: number;
      voteOptionRemove: number;
    }
  };

  readonly itemExpiry: {
    timestamp: number;
    isSoon: boolean;
    hasExpired: boolean;
  };


  private readonly SOON_DURATION: number = 1000 * 60 * 60 * 24; // 24 hours
  private destroy$: Subject<void> = new Subject();
  private selectedMarketId: number = 0;
  private isActioning: FormControl = new FormControl(false);
  private flagProposalControl: FormControl = new FormControl('');


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ListingItemDetailInputs,
    private _store: Store,
    private _cdr: ChangeDetectorRef,
    private _detailsService: ListingDetailService,
    private _snackbar: SnackbarService,
    private _unlocker: WalletEncryptionService
  ) {

    const defaultImagePath = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;

    const isInputValuesObject = isBasicObjectType(data);
    const userDestinationCountry = this._store.selectSnapshot(MarketState.settings).userRegion;

    const input: ListingItemDetail = isInputValuesObject && isBasicObjectType(data.listing) ? JSON.parse(JSON.stringify(data.listing)) : {};

    if (typeof input.marketId === 'number' && input.marketId > 0) {
      this.selectedMarketId = input.marketId;
    }

    const inputCategory = isBasicObjectType(input.category) ? input.category : { title:  TextContent.UNSET_VALUE };
    const inputEscrow = isBasicObjectType(input.escrow) ?
      input.escrow : { buyerRatio: MADCT_ESCROW_PERCENTAGE_DEFAULT, sellerRatio: MADCT_ESCROW_PERCENTAGE_DEFAULT };
    const inputTimeValues = isBasicObjectType(input.timeData) ? input.timeData : { created: 0, expires: 0};
    const inputExtras = isBasicObjectType(input.extra) ? input.extra : { isOwn: false, favouriteId: 0, flaggedProposal: '' };

    // Validate and extract images
    const isImagesObject = isBasicObjectType(input.images);
    let inputImages = !isImagesObject || !Array.isArray(input.images.images) ?
        [] :
        input.images.images.filter(img => (typeof img.THUMBNAIL === 'string') && (typeof img.IMAGE === 'string'));

        const hasNoImages = inputImages.length === 0;

    if (inputImages.length === 0) {
      inputImages.push({THUMBNAIL: defaultImagePath, IMAGE: defaultImagePath});
    }

    const featuredImgIdx = isImagesObject ? +input.images.featured || 0 : 0;

    if ((featuredImgIdx > 0) && featuredImgIdx < inputImages.length) {
      // re-order the featured image to the front of the images list if not already there
      inputImages = [...inputImages.splice(featuredImgIdx, 1), ...inputImages];
    }

    // Validate and extract shipping info
    const isShipSource = isBasicObjectType(input.shippingFrom);
    const shipSource = isShipSource && (typeof input.shippingFrom.name === 'string') ? input.shippingFrom.name : '';
    const isShipDests = Array.isArray(input.shippingTo);
    const shipDests: string[] = [];
    const isLocalShipping = userDestinationCountry.length > 0 &&
        userDestinationCountry === (isShipSource && (typeof input.shippingFrom.code === 'string') ? input.shippingFrom.code : '');

    let canShip = false;
    if (isShipDests) {
      input.shippingTo.forEach(dest => {
        if (typeof dest.name === 'string') {
          shipDests.push(dest.name);
        }
        if (!canShip && (typeof dest.code === 'string') && (dest.code === userDestinationCountry)) {
          canShip = true;
        }
      });
    }
    canShip = canShip || (userDestinationCountry.length === 0) || (shipDests.length === 0);

    // Validate and extract initial pricing info
    const inputPrice = isBasicObjectType(input.price) ? input.price : { base: 0, shippingDomestic: 0, shippingIntl: 0};
    const shipBasePrice = new PartoshiAmount(+inputPrice.base, true);
    const shipLocalPrice = new PartoshiAmount(+inputPrice.shippingDomestic, true);
    const shipIntlPrice = new PartoshiAmount(+inputPrice.shippingIntl, true);
    const shipActualPrice = new PartoshiAmount((isLocalShipping ? shipLocalPrice : shipIntlPrice).partoshis(), true);

    // NB! The price values calculated below use a bit of JS object referential trickery to avoid creating new objects for price type.
    //  ie: the PartoshiAmount is modified and then "snapshot" using the particlString() method (which returns a string value).
    //  Subsequent uses of the same PartoshiAmount object build on top of the last modified value.

    this.details = {
      id: +input.id > 0 ? input.id : 0,
      hash: typeof input.hash === 'string' ? input.hash : '',
      title: typeof input.title === 'string' ? input.title : TextContent.UNSET_VALUE,
      summary: typeof input.summary === 'string' ? input.summary : TextContent.UNSET_VALUE,
      description: typeof input.description === 'string' ? input.description : TextContent.UNSET_VALUE,
      images: {
        hasNoImages: hasNoImages,
        images: inputImages.map(img => new ImageItem({src: img.IMAGE, thumb: img.THUMBNAIL}))
      },
      price: {
        base: shipBasePrice.particlsString(),
        shipping: {
          local: shipLocalPrice.particlsString(),
          intl: shipIntlPrice.particlsString(),
          actual: shipActualPrice.particlsString()
        },
        escrow: {
          local: (new PartoshiAmount(shipLocalPrice.add(shipBasePrice).partoshis(), true))
            .multiply(inputEscrow.buyerRatio / 100)
            .particlsString(),
          intl: (new PartoshiAmount(shipIntlPrice.add(shipBasePrice).partoshis(), true))
            .multiply(inputEscrow.buyerRatio / 100)
            .particlsString(),
          actual: (new PartoshiAmount(shipActualPrice.add(shipBasePrice).partoshis(), true))
            .multiply(inputEscrow.buyerRatio / 100)
            .particlsString(),
        },
        total: {
          local: shipLocalPrice.add(new PartoshiAmount(shipLocalPrice.partoshis(), true)
            .multiply(inputEscrow.buyerRatio / 100))
            .particlsString(),
          intl: shipIntlPrice.add(new PartoshiAmount(shipIntlPrice.partoshis(), true)
            .multiply(inputEscrow.buyerRatio / 100))
            .particlsString(),
          actual: shipActualPrice.add(new PartoshiAmount(shipActualPrice.partoshis(), true)
            .multiply(inputEscrow.buyerRatio / 100))
            .particlsString(),
        },
      },
      escrowRatios: {
        buyer: +inputEscrow.buyerRatio,
        seller: +inputEscrow.sellerRatio,
        isRecommendedDefault: (+inputEscrow.buyerRatio === MADCT_ESCROW_PERCENTAGE_DEFAULT) &&
          (+inputEscrow.sellerRatio === MADCT_ESCROW_PERCENTAGE_DEFAULT),
      },
      category: typeof inputCategory.title === 'string' ? inputCategory.title : TextContent.UNSET_VALUE,
      marketAddress: getValueOrDefault(input.marketHash, 'string', ''),
      seller: getValueOrDefault(input.seller, 'string', ''),
      shipping: {
        source: shipSource || TextContent.UNSET_VALUE,
        selectedDestination: userDestinationCountry,
        destinations: shipDests,
        canShip: canShip,
      },
      created: +inputTimeValues.created || 0,
      isOwner: typeof inputExtras.isOwn === 'boolean' ? inputExtras.isOwn : false,
      favouriteId:  typeof inputExtras.favouriteId === 'number' ? inputExtras.favouriteId : 0,
      governance: {
        proposalHash: '',
        voteCast: -1,
        voteOptionKeep: -1,
        voteOptionRemove: -1
      }
    };

    this.showComments = isInputValuesObject && (typeof data.canReview === 'boolean') && (this.details.id > 0) ?
        data.canReview : false;

    this.showChatPanel = isInputValuesObject && (typeof data.displayChat === 'boolean') && (this.details.id > 0) ?
        data.displayChat : false;


    const expiryTime = +inputTimeValues.expires || 0;
    const now = Date.now();

    this.itemExpiry = {
      timestamp: expiryTime,
      hasExpired: (expiryTime > 0) && (now >= expiryTime),
      isSoon: this.isExpiringSoon(now, expiryTime),
    };

    if (isInputValuesObject && typeof data.initTab === 'string') {
      this.initialTab = data.initTab === 'review' && this.showComments ? 'review' : this.initialTab;
    }
  }


  ngOnInit() {

    const query$ = [];
    const hasSetActions = isBasicObjectType(this.data) && isBasicObjectType(this.data.displayActions);
    const doDisplayGovernance = hasSetActions &&
        getValueOrDefault(this.data.displayActions.governance, 'boolean', false) &&
        (this.selectedMarketId > 0);
    const providedProposalHash = isBasicObjectType(this.data) &&
        isBasicObjectType(this.data.listing) &&
        isBasicObjectType(this.data.listing.extra) ? getValueOrDefault(this.data.listing.extra.flaggedProposal, 'string', '') : '';

    if ( hasSetActions ) {
      this.displayActions.cart = getValueOrDefault(this.data.displayActions.cart, 'boolean', this.displayActions.cart);
      this.displayActions.fav = getValueOrDefault(this.data.displayActions.fav, 'boolean', this.displayActions.fav);
      this.displayActions.governance = doDisplayGovernance;

      if (doDisplayGovernance) {

        const flagChange$ = this.flagProposalControl.valueChanges.pipe(
          switchMap((hashValue: string) => {

            if (hashValue && !this.details.governance.proposalHash) {
              this.details.governance.proposalHash = hashValue;

              this.eventFlaggedItem.emit(hashValue);

              if ((this.details.governance.voteOptionKeep >= 0) && (this.details.governance.voteOptionRemove >= 0)) {
                return of(hashValue);
              }

              // options are missing, so fetch the available options (along with which option, if any, the user has previously selected)
              return this._detailsService.fetchVotingAction(this.selectedMarketId, this.details.governance.proposalHash).pipe(
                tap((voteData) => {

                  if ( !isBasicObjectType(voteData)) {
                    return;
                  }

                  if (Array.isArray(voteData.proposalOptions)) {
                    voteData.proposalOptions.forEach(po => {

                      if (po && po.description === 'KEEP') {
                        this.details.governance.voteOptionKeep = +po.optionId >= 0 ?
                          +po.optionId : this.details.governance.voteOptionKeep;
                      }
                      if (po && po.description === 'REMOVE') {
                        this.details.governance.voteOptionRemove = +po.optionId >= 0 ?
                          +po.optionId : this.details.governance.voteOptionRemove;
                      }
                    });
                  }

                  if (isBasicObjectType(voteData.votedProposalOption) && +voteData.votedProposalOption.optionId >= 0) {
                    this.details.governance.voteCast = voteData.votedProposalOption.optionId;
                  }
                }),
                tap(() => this._cdr.detectChanges())
              );
            }

            return of(hashValue);
          }),
          takeUntil(this.destroy$)
        );

        query$.push(flagChange$);

        if (!providedProposalHash) {
          // item has not been flagged, so listen for any incoming indication to indicate differently
          query$.push(
            this._detailsService.getListenerFlaggedItem(this.details.hash).pipe(
              tap((flagMsg) => {
                if (isBasicObjectType(flagMsg) && (typeof flagMsg.objectHash === 'string')) {
                  this.flagProposalControl.setValue(flagMsg.objectHash);
                }
              }),
              takeUntil(this.destroy$)
            )
          );
        }
      }
    }

    if ((this.itemExpiry.timestamp > 0) && (!this.itemExpiry.hasExpired)) {
      query$.push(
        timer(Date.now() % 1000, 1000).pipe(
          tap((count) => {
            const now = Date.now();
            if (now > this.itemExpiry.timestamp) {
              this.itemExpiry.hasExpired = true;
              this.itemExpiry.isSoon = false;
              if (this.displayActions.governance) {
                this.details.governance.voteCast = NaN;
              }
              this.displayActions.fav = false;
              this.destroy$.next();
            } else if (!this.itemExpiry.isSoon && this.isExpiringSoon(now, this.itemExpiry.timestamp)) {
              this.itemExpiry.isSoon = true;
            }

            if (this.itemExpiry.isSoon) {
              this.expiryTimer = this.formatSeconds( (this.itemExpiry.timestamp - now) / 1000);
            }
            if (this.itemExpiry.isSoon || this.itemExpiry.hasExpired) {
              this._cdr.detectChanges();
            }
          }),
          takeUntil(this.destroy$)
        )
      );
    } else {
      if (this.displayActions.governance) {
        this.details.governance.voteCast = NaN;
      }
    }

    this.isActioning.valueChanges.pipe(
      tap((isBusy: boolean) => {
        if (typeof isBusy === 'boolean') {
          this.canAction = !isBusy;
          this._cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$)
    );

    if (query$.length > 0) {
      merge(...query$).subscribe();
    }

    // Action the provided proposal value.
    //  NB! From code above, no flagged message listener is set if this value exists. Which makes sense because we don't need to listen for
    //  incoming flagged messages if its known that the item is already flagged.
    //  However, still need to fetch the user vote and available options.
    this.flagProposalControl.setValue(providedProposalHash);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  actionFlagItem() {
    if (!this.displayActions.governance || (this.details.governance.proposalHash.length > 0) || this.isActioning.value) {
      return;
    }
    this.isActioning.setValue(true);

    this._unlocker.unlock({timeout: 10}).pipe(
      concatMap((unlocked: boolean) => iif(
        () => unlocked,
        defer(() => this._detailsService.reportItem(this.details.id).pipe(
          tap((proposalHash) => {
            this.flagProposalControl.setValue(proposalHash);
          })
        ))
      )),
      catchError(() => {
        this._snackbar.open(TextContent.FLAG_SET_FAILED, 'warn');
        return of('');
      }),
      finalize(() => this.isActioning.setValue(false))
    ).subscribe();
  }


  actionVoteItem(option: 'KEEP' | 'REMOVE') {
    if (this.isActioning.value ||
        !this.displayActions.governance ||
        (this.details.governance.proposalHash.length === 0) ||
        (this.details.governance.voteOptionKeep < 0) ||
        (this.details.governance.voteOptionRemove < 0)
    ) {
      return;
    }
    this.isActioning.setValue(true);

    const selectedVote = option === 'KEEP' ? this.details.governance.voteOptionKeep : this.details.governance.voteOptionRemove;

    this._unlocker.unlock({timeout: 10}).pipe(
      concatMap((unlocked: boolean) => iif(
        () => unlocked,
        defer(() => this._detailsService.voteOnItemProposal(this.selectedMarketId, this.details.governance.proposalHash, selectedVote).pipe(
          tap((success) => {
            if (success) {
              this.details.governance.voteCast = selectedVote;
              // no need to detect display changes as that will be done via the isActioning value change
            } else {
              this._snackbar.open(TextContent.VOTE_SET_FAILED, 'warn');
            }
          })
        ))
      )),
      finalize(() => this.isActioning.setValue(false))
    ).subscribe(
      null,
      () => {
        this._snackbar.open(TextContent.VOTE_SET_FAILED, 'warn');
      }
    );
  }


  actionToggleFavItem() {
    if (!this.displayActions.fav || this.isActioning.value) {
      return;
    }
    this.isActioning.setValue(true);

    let query$: Observable<any>;

    if (this.details.favouriteId > 0) {
      query$ = this._detailsService.removeFavourite(this.details.favouriteId).pipe(
        tap((resp) => {
          if (resp) {
            this.details.favouriteId = 0;
          }
        })
      );
    } else {
      query$ = this._detailsService.addFavourite(this.details.id).pipe(
        tap((favId) => {
          this.details.favouriteId = favId;
        })
      );
    }

    query$.pipe(
      tap(() => {
        // no need to detect display changes as that will be done via the isActioning value change
        this.eventFavouritedItem.emit(this.details.favouriteId);
      }),
      finalize(() => this.isActioning.setValue(false))
    ).subscribe(
      null,
      (err) => {
        this._snackbar.open(TextContent.FAV_SET_FAILED, 'warn');
      }
    );
  }


  actionAddItemToCart() {
    if (!this.displayActions.cart || this.isActioning.value) {
      return;
    }
    this.isActioning.setValue(true);
    const currentCartId = this._store.selectSnapshot(MarketState.availableCarts)[0].id;

    this._detailsService.addItemToCart(this.details.id, currentCartId).pipe(
      finalize(() => this.isActioning.setValue(false))
    ).subscribe(
      () => {
        this._snackbar.open(TextContent.CART_ADD_SUCCESS);
      },
      (err) => {
        let msg = TextContent.CART_ADD_FAILED;
        if (err === 'ListingItem already added to ShoppingCart') {
          msg = TextContent.CART_ADD_DUPLICATE;
        }
        this._snackbar.open(msg, 'warn');
      }
    );
  }


  private isExpiringSoon(current: number, future: number): boolean {
    return (current < future) && (current > (future - this.SOON_DURATION));
  }


  private formatSeconds(sec: number): string {
    // @TODO: zaSmilingIdiot 2020-07-16 -> Improve this type of crappy string building for translations
    const seconds = Math.floor(sec % 60),
          minutes = Math.floor((sec / 60) % 60),
          hours = Math.floor((sec / 3600) % 3600);

    if ((hours === 0) && (minutes === 0) ) {
      return TextContent.TIMER_SECONDS_REMAINING;
    }
    return `${hours.toString().padStart(2, '0')} h ${minutes.toString().padStart(2, '0')} min ${seconds.toString().padStart(2, '0')} sec`;
  }
}
