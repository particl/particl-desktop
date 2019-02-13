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
        }, {
            status: 'awaiting',
            class: 'pending',
            status_info: 'Awaiting publication!',
            action_icon: 'part-check',
            action_button: 'Awaiting publication',
            action_tooltip: 'Waiting for listing to become active on the network!',
            action_color: 'primary',
            action_disabled: true
        },
        {
            status: 'published',
            class: 'published',
            status_info: 'Active, published listing template',
            action_icon: 'part-check',
            action_button: 'Published',
            action_tooltip: 'Listing is active on the network!',
            action_color: 'primary',
            action_disabled: true
        },
        {
            status: 'expired',
            class: 'published',
            status_info: 'Expired, expire listing template',
            action_icon: 'part-check',
            action_button: 'Expired',
            action_tooltip: 'Listing is expired on the network!',
            action_color: 'primary',
            action_disabled: true
        }
        ];
    get(status: string): UiStatus {
        return this.states.find((state: UiStatus) => state.status === status);
    }
}
