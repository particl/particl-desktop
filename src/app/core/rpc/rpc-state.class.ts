import { RPCService } from './rpc.service';

export class RPCStateClass {
  constructor(private rpc: RPCService) {

    // Start polling...
    this.rpc.registerStateCall('getwalletinfo', 1000);
    this.rpc.registerStateCall('getblockchaininfo', 5000);
    this.rpc.registerStateCall('getnetworkinfo', 10000);
    this.rpc.registerStateCall('getstakinginfo', 10000);

    this.lastBlockTimeState();
    this.blockLoop();
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
      setTimeout(this.blockLoop, 1000);
    }
    this.rpc.stateCall('getblockchaininfo');
  }
}
