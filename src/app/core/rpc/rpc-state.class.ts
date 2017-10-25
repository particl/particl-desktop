import { Log } from 'ng2-logger';
import { RPCService } from './rpc.service';


export class RPCStateClass {
  private log: any = Log.create('rpc-state.class');

  constructor(private rpc: RPCService) {

    // Start polling...
    this.rpc.registerStateCall('getwalletinfo', 1000);
    this.rpc.registerStateCall('getblockchaininfo', 5000);
    this.rpc.registerStateCall('getnetworkinfo', 10000);
    this.rpc.registerStateCall('getstakinginfo', 10000);

    this.lastBlockTimeState();
    this.blockLoop();
    this.walletLockedState();
    this.coldStakeLoop();
    this.initWalletState();
  }

  private lastBlockTimeState() {
    let _checkLastBlock = false;
    this.rpc.state.observe('mediantime').subscribe(
      mediantime => {
        const lastblocktime = new Date(mediantime * 1000);

        this.rpc.state.set('lastblocktime', lastblocktime);
        if (!_checkLastBlock && new Date().getTime() - (4 * 60 * 1000) > lastblocktime.getTime()) {
          setTimeout(() => {
            _checkLastBlock = false;
            this.rpc.stateCall('getblockchaininfo');
          }, 100);
          _checkLastBlock = true;
        }
      });
  }

  private blockLoop() {
    if (this.rpc.state.get('blocks') === 0) {
      setTimeout(this.blockLoop.bind(this), 1000);
    }
    this.rpc.stateCall('getblockchaininfo');
  }

  private walletLockedState() {
    this.rpc.state.observe('encryptionstatus')
    .subscribe(status => this.rpc.state
      .set('locked', ['Locked', 'Unlocked, staking only'].includes(status)));
  }

  private coldStakeLoop() {
    this.log.d('coldStakeLoop');
    if(this.rpc.state.get('locked') === false) {
      // only available if unlocked
      this.rpc.call('walletsettings', ['changeaddress'])
      .subscribe(
        response => {
        // check if account is active
        if (response.changeaddress === 'default') {
          this.log.d('coldstaking disabled');
          this.rpc.state.set('coldstaking', false);
        } else if(response.changeaddress.coldstakingaddress !== undefined) {
          this.log.d('coldstaking enabled');
          this.rpc.state.set('coldstaking', true);
        }
      },
      error => this.log.er('walletsettings changeaddress, returned an error', error));

    }

    setTimeout(this.coldStakeLoop.bind(this), 1000);
  }

    private initWalletState() {

      this.rpc.state.observe('encryptionstatus').take(1)
      .subscribe(
        status => {
          const locked = this.rpc.state.get('locked');

          if (locked) {
            this.rpc.state.set('walletInitialized', true);
            return;
          }

          this.rpc.call('extkey', ['list'])
          .subscribe(
            response => {
                // check if account is active
                if (response.result === 'No keys to list.') {
                  this.rpc.state.set('walletInitialized', false);
                } else {
                  this.rpc.state.set('walletInitialized', true);
                }
              },
              error => this.log.er('RPC Call returned an error', error));
        });
    }
  }
