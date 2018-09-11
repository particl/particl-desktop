import { Notify } from './notify.model';
import { Show } from './show.model';

export class DisplaySettings {
    language: string;
    units: string;
    theme: string;
    rows: number;
    addresses: boolean;
    advanced: boolean;
    notifyPayments: boolean;
    notifyStakes: boolean;
    notifyOrders: boolean;
    notifyProposals: boolean;
    notify: Notify;
    show: Show;

    constructor(obj: any) {
        this.language = obj.language;
        this.units = obj.units;
        this.theme = obj.theme;
        this.rows = obj.rows;
        this.advanced = obj.advanced;
        this.notifyPayments = obj.notifyPayments;
        this.notifyStakes = obj.notifyStakes;
        this.notifyProposals = obj.notifyProposals;
        this.notifyOrders = obj.notifyOrders;
        this.addresses = obj.addresses;
        this.notify = new Notify(obj.notify);
        this.show = new Show(obj.show);
    }
}


