import { RPCService } from './rpc.service';

export class RPCStateClass {
  constructor(private rpc: RPCService) {

    // Start polling...
    this.rpc.registerStateCall('getwalletinfo', 1000);
    this.rpc.registerStateCall('getblockchaininfo', 15000);
    this.rpc.registerStateCall('getnetworkinfo', 10000);
    this.rpc.registerStateCall('getstakinginfo', 10000);

    // TODO: This probably doesn't belong here, don't know where to move it :?
    this.rpc.state.observe('mediantime').subscribe(
      mediantime => {
        const lastblocktime = new Date(mediantime * 1000);
        this.rpc.state.set('lastblocktime', lastblocktime);
        if (new Date().getTime() - (10 * 60 * 1000) > lastblocktime.getTime()) {
          this.rpc.stateCall('getblockchaininfo');
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
