export class Balances {

  constructor(
    private _total: number, private _public: number,
    private _blind: number,  private _private: number,
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
    switch (type) {
      case 'TOTAL':
        return this.getTotal();
      case 'PUBLIC':
        return this.getPublic();
      case 'PRIVATE':
        return this.getPrivate();
      case 'BLIND':
        return this.getBlind();
      case 'STAKE':
        return this.getStake();
    }
  }

}
