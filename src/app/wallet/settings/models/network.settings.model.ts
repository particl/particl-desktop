export class NetworkSettings {
    upnp: boolean;
    proxy: boolean;
    proxyIP: string;
    proxyPort: number;
    socketVersion: number;
    constructor(obj: any) {
        this.upnp = obj.upnp;
        this.proxy = obj.proxy;
        this.proxyIP = obj.proxyIP;
        this.proxyPort = obj.proxyPort;
        this.socketVersion = obj.socketVersion;
    }
}
