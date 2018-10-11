export class NetworkSettings {
  upnp: boolean;
  proxyIP: string;
  proxyPort: number;
  enabledProxy: boolean;
  proxy: string;
  constructor(obj: any) {
    this.upnp = obj.upnp;
    this.enabledProxy = obj.enabledProxy;
    this.proxyIP = obj.proxyIP;
    this.proxyPort = obj.proxyPort;
    this.proxy = `${this.proxyIP}:${this.proxyPort}`;
  }
}
