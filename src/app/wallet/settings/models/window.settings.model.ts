export class WindowSettings {
    tray: boolean;
    minimize: boolean;
    autostart: boolean;

    constructor(obj: any) {
        this.autostart = obj.autostart;
        this.tray = obj.tray;
        this.minimize = obj.minimize;
    }
}
