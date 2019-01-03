const postData = {
    'object': {
        'id': 9,
        'hash': '299598afd9813aa83a7cc85ac00dd1783f375570d531c3de793d26ddfc9baea8',
        'profileId': 1,
        'updatedAt': 1546529371043,
        'createdAt': 1546529371043,
        'PaymentInformation': {
            'id': 206,
            'type': 'SALE',
            'listingItemId': null,
            'listingItemTemplateId': 9,
            'updatedAt': 1546529371121,
            'createdAt': 1546529371121,
            'Escrow': {
                'id': 206,
                'type': 'MAD',
                'paymentInformationId': 206,
                'updatedAt': 1546529441434,
                'createdAt': 1546529371449,
                'Ratio': {
                    'id': 208,
                    'buyer': 100,
                    'seller': 100,
                    'escrowId': 206,
                    'updatedAt': 1546529441459,
                    'createdAt': 1546529441459
                }
            },
            'ItemPrice': {
                'id': 205,
                'currency': 'PARTICL',
                'basePrice': 1,
                'paymentInformationId': 206,
                'cryptocurrencyAddressId': null,
                'updatedAt': 1546529371134,
                'createdAt': 1546529371134,
                'ShippingPrice': {
                    'id': 205,
                    'domestic': 0.5,
                    'international': 0.61,
                    'itemPriceId': 205,
                    'updatedAt': 1546529371147,
                    'createdAt': 1546529371147
                }
            }
        },
        'ListingItemObjects': [

        ],
        'Profile': {
            'id': 1,
            'name': 'DEFAULT',
            'address': 'pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw',
            'updatedAt': 1543921282742,
            'createdAt': 1543920717681
        },
        'MessagingInformation': [

        ],
        'ItemInformation': {
            'id': 212,
            'title': 'listing for Jason testing',
            'shortDescription': 'listing for Jason testing ',
            'longDescription': 'listing for Jason testing',
            'itemCategoryId': 3,
            'listingItemId': null,
            'listingItemTemplateId': 9,
            'updatedAt': 1546529441252,
            'createdAt': 1546529371101,
            'ShippingDestinations': [

            ],
            'ItemLocation': {
                'id': 187,
                'region': 'IN',
                'address': 'a',
                'itemInformationId': 212,
                'updatedAt': 1546529441354,
                'createdAt': 1546529371318,
                'LocationMarker': {

                }
            },
            'ItemImages': [

            ],
            'ItemCategory': {
                'id': 3,
                'key': 'cat_particl_free_swag',
                'name': 'Free Swag',
                'description': '',
                'parentItemCategoryId': 2,
                'updatedAt': 1546529207019,
                'createdAt': 1543920716250,
                'ParentItemCategory': {
                    'id': 2,
                    'key': 'cat_particl',
                    'name': 'Particl',
                    'description': '',
                    'parentItemCategoryId': 1,
                    'updatedAt': 1546529206983,
                    'createdAt': 1543920716220,
                    'ParentItemCategory': {
                        'id': 1,
                        'key': 'cat_ROOT',
                        'name': 'ROOT',
                        'description': 'root item category',
                        'parentItemCategoryId': null,
                        'updatedAt': 1546529206921,
                        'createdAt': 1543920716188
                    }
                }
            }
        },
        'ListingItems': [

        ]
    },
    'category': {
        'category': {
            'id': 3,
            'key': 'cat_particl_free_swag',
            'name': 'Free Swag',
            'description': '',
            'parentItemCategoryId': 2,
            'updatedAt': 1546529207019,
            'createdAt': 1543920716250,
            'ParentItemCategory': {
                'id': 2,
                'key': 'cat_particl',
                'name': 'Particl',
                'description': '',
                'parentItemCategoryId': 1,
                'updatedAt': 1546529206983,
                'createdAt': 1543920716220,
                'ParentItemCategory': {
                    'id': 1,
                    'key': 'cat_ROOT',
                    'name': 'ROOT',
                    'description': 'root item category',
                    'parentItemCategoryId': null,
                    'updatedAt': 1546529206921,
                    'createdAt': 1543920716188
                }
            }
        }
    },
    'createdAt': '03-01-2019',
    'status': 'awaiting',
    'basePrice': {
        'amount': 1,
        'maxRoundingDigits': 8
    },
    'domesticShippingPrice': {
        'amount': 0.5,
        'maxRoundingDigits': 8
    },
    'internationalShippingPrice': {
        'amount': 0.61,
        'maxRoundingDigits': 8
    },
    'escrowPriceInternational': {
        'amount': 1.61,
        'maxRoundingDigits': 8
    },
    'escrowPriceDomestic': {
        'amount': 1.5,
        'maxRoundingDigits': 8
    },
    'domesticTotal': {
        'amount': 1.5,
        'maxRoundingDigits': 8
    },
    'internationalTotal': {
        'amount': 1.61,
        'maxRoundingDigits': 8
    },
    'totalAmountInternaltional': {
        'amount': 3.22,
        'maxRoundingDigits': 8
    },
    'totalAmountDomestic': {
        'amount': 3,
        'maxRoundingDigits': 8
    },
    'memo': '',
    'expireTime': 4,
    'proposalHash': '',
    'submitterAddress': '',
    'expiredTime': 'NaN-NaN-NaN',
    'imageCollection': {
        'images': [

        ],
        'default': {
            'image': {
                'ItemImageDatas': [

                ]
            }
        },
        'imageItems': [

        ]
    }
};

export {
    postData
};
