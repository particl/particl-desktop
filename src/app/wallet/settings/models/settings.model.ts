import { MainSettings } from './main-settings.model';
import { NetworkSettings } from './network.settings.model';
import { DisplaySettings } from './display/display.settings.model';
import { WindowSettings } from './window.settings.model';
import { NavigationSettings } from './navigation.settings.model';
import { MarketSettings } from './market.settings.model';

export class Settings {
    main: MainSettings;
    network: NetworkSettings;
    window: WindowSettings;
    display: DisplaySettings;
    navigation: NavigationSettings;
    market: MarketSettings;

    constructor(obj: any) {
        this.main = new MainSettings(obj.main);
        this.network = new NetworkSettings(obj.network);
        this.window = new WindowSettings(obj.window);
        this.display = new DisplaySettings(obj.display);
        this.navigation = new NavigationSettings(obj.navigation);
        this.market = new MarketSettings(obj.market);
    }
}
