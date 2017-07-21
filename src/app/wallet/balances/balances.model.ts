export class Balances {

  constructor(private _total: number, private _public: number, private _blind: number,  private _private: number,
    private _stake: number) { }

  getTotal() {
    return this._total;
  }
  getPublic() {
    return this._public;
  }

  getBlind() {
    return this._blind;
  }

  getPrivate() {
    return this._private;
  }
  getStake() {
    return this._stake;
  }

  getBalance(type: string) {
    if (type === 'TOTAL') {
      return this.getTotal();
    } else if (type === 'PUBLIC') {
      return this.getPublic();
    } else if (type === 'PRIVATE') {
      return this.getPrivate();
    } else if (type === 'BLIND') {
      return this.getBlind();
    } else if (type === 'STAKE') {
      return this.getStake();
    }
  }

}
