import { Notify } from './notify.model';
import { Show } from './show.model';

export class DisplaySettings {
    language: string;
    units: string;
    theme: string;
    rows: number;
    addresses: boolean;
    notify: Notify;
    show: Show;

    constructor(obj: any) {
        this.language = obj.language;
        this.units = obj.units;
        this.theme = obj.theme;
        this.rows = obj.rows;
        this.addresses = obj.addresses;
        this.notify = new Notify(obj.notify);
        this.show = new Show(obj.show);
    }
}


