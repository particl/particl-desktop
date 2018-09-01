export class NavigationSettings {
    marketExpanded: boolean;
    walletExpanded: boolean;
    constructor(obj: any) {
        this.marketExpanded = obj.marketExpanded;
        this.walletExpanded = obj.walletExpanded;
    }
}
