export class WindowSettings {
    tray: boolean;
    minimize: boolean;
    constructor(obj: any) {
        this.tray = obj.tray;
        this.minimize = obj.minimize;
    }
}
