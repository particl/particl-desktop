import { BotService } from 'app/core/bot/bot.service';
import { RpcService } from 'app/core/core.module';
import { Subscription, Observable } from 'rxjs';
import { PartoshiAmount } from 'app/core/util/utils';
import { tap } from 'rxjs/operators';

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

  // Bots
  public availableBots: any[] = [];

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
  }

  private async getSupportedCurrencies() {
    this.loading = true;
    this.availableCurrencies = [];

    this.availableBots = [];
    try {
      this.availableBots = await this.botService.search(0, 999999, 'EXCHANGE', '', true);
    } catch (e) {}

    if (this.availableBots.length === 0) {
      this.noBots = true;
      this.loading = false;
      return;
    } else {
      this.noBots = false;
    }

    this.completedRequests = 0;
    this.botRequestSubscriptions = [];
    this.totalBots = this.availableBots.length;
    for (const bot of this.availableBots) {
      const sub = this.botService.command(bot.address, 'GET_SUPPORTED_CURRENCIES').subscribe(
        (response) => {
          this.completedRequests++;
          this.loading = this.completedRequests < this.totalBots;

          if (response.error) {
            return;
          }
          const currencies = response.data;
          bot.currencies = currencies;

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
    this.selectedOffer = null;

    let offerFromBots = this.availableBots.filter((bot) => !!bot.currencies.find((currency) => currency.symbol === this.selectedCurrency.symbol));

    this.completedRequests = 0;
    this.botRequestSubscriptions = [];
    this.totalBots = offerFromBots.length;
    for (const bot of offerFromBots) {
      const sub = this.botService.command(bot.address, 'GET_OFFER', this.selectedCurrency.symbol, 'PART', this.requiredParticls).subscribe(
        (response) => {
          this.completedRequests++;
          this.loading = this.completedRequests < this.totalBots;

          if (response.error) {
            this.availableOffers.push({
              bot: bot,
              error: response.error
            });
            return;
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
        this.exchangeData = {
          error: result.error
        }
        return ;
      }

      this.exchangeData = result.data;

    } catch (e) {
      this.loading = false;
      this.exchangeData = {
        error: 'Error with exchange command.'
      }
    }
  }

  getExchangeStatusUpdate(): Observable<any> {
    return this.botService.command(this.selectedOffer.bot.address, 'EXCHANGE_STATUS', this.exchangeData.track_id).pipe(
      tap((status) => {
        if (status.error) {
          this.status['status'] = status.error;
          return;
        }
        if (status.data.tx_from) {
          this.status = status.data;
        }
        if (status.data.tx_to) {
          this.isComplete = true;
        }
      })
    );
  }
}
