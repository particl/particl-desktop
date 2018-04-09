interface UiStatus {
    status: string;
    class: string;
    status_info: string;
    action_icon: string;
    action_button: string;
    action_tooltip: string;
    action_color: string;
    action_disabled: boolean;
}

export class Status {
    private states: Array<UiStatus> = [
        {
            status: 'unpublished',
            class: 'unpublished',
            status_info: 'Inactive, unpublished listing template – used to tweak your listing before publishing'
                + '(or after you take down your active listings later)',
            action_icon: 'part-check',
            action_button: 'Publish',
            action_tooltip: 'Activate listing and put it on sale',
            action_color: 'primary',
            action_disabled: false
        }];
    get(status: string): UiStatus {
        return this.states.find((state: UiStatus) => state.status === status);
    }
}
