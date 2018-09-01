export class MainSettings {
    autostart: boolean;
    detachDatabases: number;
    feeAmount: number;
    feeCurrency: number;
    autoRing: number;
    minRing: number;
    maxRing: number;
    stake: number;
    reserveAmount: number;
    reserveCurrency: number;
    rewardAddressEnabled: number;
    rewardAddress: number;
    foundationDonation: number;
    secureMessaging: boolean;
    thin: boolean;
    thinFullIndex: boolean;
    thinIndexWindow: number;
    stakeInterval: number

    constructor(obj: any) {
        this.autostart = obj.autostart;
        this.detachDatabases = obj.detachDatabases;
        this.feeAmount = obj.feeAmount;
        this.feeCurrency = obj.feeCurrency;
        this.autoRing = obj.autoRing;
        this.minRing = obj.minRing;
        this.maxRing = obj.maxRing;
        this.stake = obj.stake;
        this.reserveAmount = obj.reserveAmount;
        this.reserveCurrency = obj.reserveCurrency;
        this.rewardAddressEnabled = obj.rewardAddressEnabled;
        this.rewardAddress = obj.rewardAddress;
        this.foundationDonation = obj.foundationDonation;
        this.secureMessaging = obj.secureMessaging;
        this.thin = obj.thin;
        this.thinFullIndex = obj.thinFullIndex;
        this.thinIndexWindow = obj.thinIndexWindow;
        this.stakeInterval = obj.stakeInterval;
    }
}
