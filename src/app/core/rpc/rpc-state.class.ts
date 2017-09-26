import { RPCService } from './rpc.service';

export class RPCStateClass {
  constructor(private rpc: RPCService) {

    // Start polling...
    this.rpc.registerStateCall('getwalletinfo', 1000);
    this.rpc.registerStateCall('getblockchaininfo', 5000);
    this.rpc.registerStateCall('getnetworkinfo', 10000);
    this.rpc.registerStateCall('getstakinginfo', 10000);

    this.rpc.state.observe('mediantime').subscribe(
      mediantime => {
        const lastblocktime = new Date(mediantime * 1000);

        this.rpc.state.set('lastblocktime', lastblocktime);

        if (new Date().getTime() - (10 * 60 * 1000) > lastblocktime.getTime()) {
          setTimeout(() => this.rpc.stateCall('getblockchaininfo'), 50);
        }

        const blockLoop = () => {
          if (this.rpc.state.get('blocks') === 0) {
            setTimeout(blockLoop, 1000);
          }
          this.rpc.stateCall('getblockchaininfo');
        }
        blockLoop();
      });
  }
}
