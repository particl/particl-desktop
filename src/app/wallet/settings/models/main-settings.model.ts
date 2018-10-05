export class MainSettings {
    feeAmount: number;
    feeCurrency: number;
    stake: number;
    reserveAmount: number;
    reserveCurrency: number;
    rewardAddressEnabled: number;
    rewardAddress: number;
    foundationDonation: number;
    secureMessaging: boolean;
    stakeInterval: number

    constructor(obj: any) {
        this.feeAmount = obj.feeAmount;
        this.feeCurrency = obj.feeCurrency;
        this.stake = obj.stake;
        this.reserveAmount = obj.reserveAmount;
        this.reserveCurrency = obj.reserveCurrency;
        this.rewardAddressEnabled = obj.rewardAddressEnabled;
        this.rewardAddress = obj.rewardAddress;
        this.foundationDonation = obj.foundationDonation;
        this.secureMessaging = obj.secureMessaging;
        this.stakeInterval = obj.stakeInterval;
    }
}
