import { BotService } from 'app/core/bot/bot.module';
import { RpcService } from 'app/core/core.module';
import { Subscription, timer } from 'rxjs';
import { PartoshiAmount } from 'app/core/util/utils';
import { switchMap } from 'rxjs/operators';

export class Exchange {

  private partoshi: number;
  get requiredParticls() {
    return new PartoshiAmount(this.partoshi).particls();
  };
  set requiredParticls(particls: number) {
    this.partoshi = new PartoshiAmount(particls * Math.pow(10, 8)).partoshis()
  };

  get requirePartoshiAmount() {
    return new PartoshiAmount(this.partoshi);
  }

  get payAmount() {
    return new PartoshiAmount(this.selectedOffer ? this.selectedOffer.amount_from * Math.pow(10, 8) : 0);
  }

  get offerAmount() {
    return new PartoshiAmount(this.selectedOffer ? this.selectedOffer.amount_to * Math.pow(10, 8) : 0);
  }

  // Currencies
  public availableCurrencies: any[] = [];
  public selectedCurrency: any;

  // Offers
  public availableOffers: any[] = [];
  public selectedOffer: any;

  // Exchange
  public exchangeData: any = null;

  public noResponse: boolean = false;
  public isComplete: boolean = false;
  public botRequestSubscriptions: Array<Subscription> = [];
  public completedRequests: number;
  public totalBots: number;
  public loading: boolean;
  public noBots: boolean;
  public status: any;
  public exchangeStatus$: Subscription;

  constructor (
    private botService: BotService,
    private rpc: RpcService
  ) {
    this.getSupportedCurrencies();
  }

  clearRequests() {
    this.loading = null;
    this.completedRequests = null;
    this.totalBots = null;
    this.noBots = null;
    this.noResponse = null;

    for (const sub of this.botRequestSubscriptions) {
      sub.unsubscribe();
    }
    if (this.exchangeStatus$) {
      this.exchangeStatus$.unsubscribe();
    }
  }

  private async getSupportedCurrencies() {
    this.loading = true;
    this.availableCurrencies = [];

    const availableBots = await this.botService.search(0, 999999, 'EXCHANGE', '', true);


    if (availableBots.length === 0) {
      this.noBots = true;
      return;
    } else {
      this.noBots = false;
    }

    this.completedRequests = 0;
    this.botRequestSubscriptions = [];
    this.totalBots = availableBots.length;
    for (const bot of availableBots) {
      const sub = this.botService.command(bot.address, 'GET_SUPPORTED_CURRENCIES').subscribe(
        (response) => {
          this.completedRequests++;
          this.loading = this.completedRequests < this.totalBots;

          if (response.error) {
            return console.error(response.error);
          }
          const currencies = response.data;

          for (const currency of currencies) {
            if (!this.availableCurrencies.find((c) => c.symbol === currency.symbol)) {
              this.availableCurrencies.push(currency);
              if (this.availableCurrencies.length === 1) {
                this.selectedCurrency = currency;
              }
            }
          }
        },
        (e) => {
          this.completedRequests++;
          this.loading = this.completedRequests < this.totalBots;

          if (!this.loading && this.availableCurrencies.length === 0) {
            this.noResponse = true;
          }
        }
      );
      this.botRequestSubscriptions.push(sub);
    }
  }

  async getExchangeOffers() {
    this.loading = true;
    this.availableOffers = [];

    const availableBots = await this.botService.search(0, 999999, 'EXCHANGE', '', true);

    if (availableBots.length === 0) {
      this.noBots = true;
      return;
    } else {
      this.noBots = false;
    }

    this.completedRequests = 0;
    this.botRequestSubscriptions = [];
    this.totalBots = availableBots.length;
    for (const bot of availableBots) {
      const sub = this.botService.command(bot.address, 'GET_OFFER', this.selectedCurrency.symbol, 'PART', this.requiredParticls).subscribe(
        (response) => {
          this.completedRequests++;
          this.loading = this.completedRequests < this.totalBots;

          if (response.error) {
            return console.error(response.error);
          }
          const offer = response.data;

          this.availableOffers.push({
            bot: bot,
            ...offer
          });
          if (this.availableOffers.length === 1) {
            this.selectedOffer = this.availableOffers[0];
          }
        },
        (e) => {
          this.completedRequests++;
          this.loading = this.completedRequests < this.totalBots;

          if (!this.loading && this.availableCurrencies.length === 0) {
            this.noResponse = true;
          }
        }
      );
      this.botRequestSubscriptions.push(sub);
    }
  }

  async getExchangeAddress() {
    this.loading = true;
    this.exchangeData = null;

    try {
      const address = await this.rpc.call('getnewaddress', ['Exchange']).toPromise();
      const result = await this.botService.command(this.selectedOffer.bot.address, 'EXCHANGE', address, this.selectedOffer.currency_from,
          this.selectedOffer.currency_to, this.selectedOffer.amount_from).toPromise();

      this.loading = false;

      if (result.error) {
        return console.error(result.error);
      }

      this.exchangeData = result.data;

      this.exchangeStatus$ = timer(0, 60000).pipe(
        switchMap(() => this.botService.command(this.selectedOffer.bot.address, 'EXCHANGE_STATUS', this.exchangeData.track_id))
      ).subscribe((status) => {
        if (status.error) {
          this.status['status'] = status.error;
          return console.error(status.error);
        }
        if (status.data.tx_from) {
          this.status = status.data;
        }
        if (status.data.tx_to) {
          this.isComplete = true;
          this.exchangeStatus$.unsubscribe();
        }
      });
    } catch (e) {
      this.loading = false;
      console.error(e);
    }
  }
}
