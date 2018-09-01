export const DEFAULT_SETTINGS = {
    main: {
        autostart: false,
        detachDatabases: 1,
        feeAmount: 1,
        feeCurrency: 1,
        autoRing: 1,
        minRing: 1,
        maxRing: 1,
        stake: 1,
        reserveAmount: 1,
        reserveCurrency: 1,
        rewardAddressEnabled: 1,
        rewardAddress: 1,
        foundationDonation: 1,
        secureMessaging: false,
        thin: false,
        thinFullIndex: false,
        thinIndexWindow: 4096,
        stakeInterval: 30
    },
    network: {
        upnp: false,
        proxy: false,
        proxyIP: '127.0.0.1',
        proxyPort: 9050,
        socketVersion: 5
    },
    window: {
        tray: false,
        minimize: true
    },
    display: {
        language: 'en',
        units: 'part',
        theme: 'light',
        rows: 10,
        addresses: true,
        notify: {
            message: true,
            sentTo: false,
            receivedWith: false,
            receivedFrom: false,
            selfPayment: false,
            partReceived: true,
            partSent: false,
            other: false
        },
        show: {
            sentTo: true,
            receivedWith: true,
            receivedFrom: true,
            selfPayment: true,
            partReceived: true,
            partSent: true,
            other: true
        },
    },
    navigation: {
        marketExpanded: true,
        walletExpanded: true
    },
    market: {
        enabled: true,
        listingsPerPage: 30,
        defaultCountry: undefined,
        listingExpiration: 4
    },
    i2p: {},
    tor: {}
}
