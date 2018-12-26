const searchListings = [{}];
export {
    searchListings
}
// const list = [
//     {
//         "object": {
//             "id": 135,
//             "hash": "dd0d07fd8e8c25489d373d84a62d41a2cb8f8c33b890952722a9910669aad28e",
//             "seller": "pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw",
//             "marketId": 1,
//             "listingItemTemplateId": 2,
//             "expiryTime": 21,
//             "receivedAt": 1544609874000,
//             "postedAt": 1544609816000,
//             "expiredAt": 1546424216000,
//             "updatedAt": 1544609898743,
//             "createdAt": 1544609898605,
//             "ItemInformation": {
//                 "id": 136,
//                 "title": "sdg",
//                 "shortDescription": "sdg",
//                 "longDescription": "dg",
//                 "itemCategoryId": 3,
//                 "listingItemId": 135,
//                 "listingItemTemplateId": null,
//                 "updatedAt": 1544609898626,
//                 "createdAt": 1544609898626,
//                 "ShippingDestinations": [],
//                 "ItemCategory": {
//                     "id": 3,
//                     "key": "cat_particl_free_swag",
//                     "name": "Free Swag",
//                     "description": "",
//                     "parentItemCategoryId": 2,
//                     "updatedAt": 1545807545123,
//                     "createdAt": 1543920716250,
//                     "ParentItemCategory": {
//                         "id": 2,
//                         "key": "cat_particl",
//                         "name": "Particl",
//                         "description": "",
//                         "parentItemCategoryId": 1,
//                         "updatedAt": 1545807545092,
//                         "createdAt": 1543920716220,
//                         "ParentItemCategory": {
//                             "id": 1,
//                             "key": "cat_ROOT",
//                             "name": "ROOT",
//                             "description": "root item category",
//                             "parentItemCategoryId": null,
//                             "updatedAt": 1545807545055,
//                             "createdAt": 1543920716188
//                         }
//                     }
//                 },
//                 "ItemImages": [],
//                 "ItemLocation": {
//                     "id": 135,
//                     "region": "AF",
//                     "address": "a",
//                     "itemInformationId": 136,
//                     "updatedAt": 1544609898636,
//                     "createdAt": 1544609898636,
//                     "LocationMarker": {}
//                 }
//             },
//             "PaymentInformation": {
//                 "id": 130,
//                 "type": "SALE",
//                 "listingItemId": 135,
//                 "listingItemTemplateId": null,
//                 "updatedAt": 1544609898651,
//                 "createdAt": 1544609898651,
//                 "Escrow": {
//                     "id": 130,
//                     "type": "MAD",
//                     "paymentInformationId": 130,
//                     "updatedAt": 1544609898662,
//                     "createdAt": 1544609898662,
//                     "Ratio": {
//                         "id": 130,
//                         "buyer": 100,
//                         "seller": 100,
//                         "escrowId": 130,
//                         "updatedAt": 1544609898671,
//                         "createdAt": 1544609898671
//                     }
//                 },
//                 "ItemPrice": {
//                     "id": 129,
//                     "currency": "PARTICL",
//                     "basePrice": 21,
//                     "paymentInformationId": 130,
//                     "cryptocurrencyAddressId": null,
//                     "updatedAt": 1544609898683,
//                     "createdAt": 1544609898683,
//                     "ShippingPrice": {
//                         "id": 129,
//                         "domestic": 2,
//                         "international": 2,
//                         "itemPriceId": 129,
//                         "updatedAt": 1544609898692,
//                         "createdAt": 1544609898692
//                     }
//                 }
//             },
//             "MessagingInformation": [],
//             "ListingItemObjects": [],
//             "ActionMessages": [{
//                 "id": 128,
//                 "action": "MP_ITEM_ADD",
//                 "nonce": null,
//                 "accepted": null,
//                 "listingItemId": 135,
//                 "updatedAt": 1544609898782,
//                 "createdAt": 1544609898782,
//                 "MessageInfo": {},
//                 "MessageObjects": [{
//                     "id": 132,
//                     "actionMessageId": 128,
//                     "dataId": "seller",
//                     "dataValue": "pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw",
//                     "updatedAt": 1544609898801,
//                     "createdAt": 1544609898801
//                 }],
//                 "MessageEscrow": {},
//                 "MessageData": {
//                     "id": 128,
//                     "actionMessageId": 128,
//                     "msgid": "000000005c10e018ed48d2082852ef501bf4fc695740d30c165b5627",
//                     "version": "0300",
//                     "received": "2018-12-12T10:17:54.000Z",
//                     "sent": "2018-12-12T10:16:56.000Z",
//                     "from": "pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw",
//                     "to": "pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA",
//                     "updatedAt": 1544609898792,
//                     "createdAt": 1544609898792
//                 }
//             }],
//             "Bids": [],
//             "Market": {
//                 "id": 1,
//                 "name": "DEFAULT",
//                 "privateKey": "2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek",
//                 "address": "pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA",
//                 "updatedAt": 1545807544987,
//                 "createdAt": 1543920716143
//             },
//             "FlaggedItem": {},
//             "ListingItemTemplate": {
//                 "id": 2,
//                 "hash": "dd0d07fd8e8c25489d373d84a62d41a2cb8f8c33b890952722a9910669aad28e",
//                 "profileId": 1,
//                 "updatedAt": 1543934205508,
//                 "createdAt": 1543934205508,
//                 "Profile": {
//                     "id": 1,
//                     "name": "DEFAULT",
//                     "address": "pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw",
//                     "updatedAt": 1543921282742,
//                     "createdAt": 1543920717681
//                 }
//             }
//         },
//         "category": {
//             "category": {
//                 "id": 3,
//                 "key": "cat_particl_free_swag",
//                 "name": "Free Swag",
//                 "description": "",
//                 "parentItemCategoryId": 2,
//                 "updatedAt": 1545807545123,
//                 "createdAt": 1543920716250,
//                 "ParentItemCategory": {
//                     "id": 2,
//                     "key": "cat_particl",
//                     "name": "Particl",
//                     "description": "",
//                     "parentItemCategoryId": 1,
//                     "updatedAt": 1545807545092,
//                     "createdAt": 1543920716220,
//                     "ParentItemCategory": {
//                         "id": 1,
//                         "key": "cat_ROOT",
//                         "name": "ROOT",
//                         "description": "root item category",
//                         "parentItemCategoryId": null,
//                         "updatedAt": 1545807545055,
//                         "createdAt": 1543920716188
//                     }
//                 }
//             }
//         },
//         "createdAt": "12-12-2018",
//         'status': 'unpublished',
//         'basePrice': {
//             'amount': 21,
//             'maxRoundingDigits': 8
//         },
//         'domesticShippingPrice': {
//             'amount': 2,
//             'maxRoundingDigits': 8
//         },
//         'internationalShippingPrice': {
//             'amount': 2,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceInternational': {
//             'amount': 23,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceDomestic': {
//             'amount': 23,
//             'maxRoundingDigits': 8
//         },
//         'domesticTotal': {
//             'amount': 23,
//             'maxRoundingDigits': 8
//         },
//         'internationalTotal': {
//             'amount': 23,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountInternaltional': {
//             'amount': 46,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountDomestic': {
//             'amount': 46,
//             'maxRoundingDigits': 8
//         },
//         'memo': '',
//         'expireTime': 4,
//         'isFlagged': false,
//         'proposalHash': '',
//         'submitterAddress': '',
//         'imageCollection': {
//             'images': [],
//             'default': {
//                 'image': { 'ItemImageDatas': [] }
//             },
//             'imageItems': []
//         },
//         'listing': {
//             'id': 135,
//             'hash': 'dd0d07fd8e8c25489d373d84a62d41a2cb8f8c33b890952722a9910669aad28e',
//             'seller': 'pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw',
//             'marketId': 1,
//             'listingItemTemplateId': 2,
//             'expiryTime': 21,
//             'receivedAt': 1544609874000,
//             'postedAt': 1544609816000,
//             'expiredAt': 1546424216000,
//             'updatedAt': 1544609898743,
//             'createdAt': 1544609898605,
//             'ItemInformation': {
//                 'id': 136,
//                 'title': 'sdg',
//                 'shortDescription': 'sdg',
//                 'longDescription': 'dg',
//                 'itemCategoryId': 3,
//                 'listingItemId': 135,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544609898626,
//                 'createdAt': 1544609898626,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 3,
//                     'key': 'cat_particl_free_swag',
//                     'name': 'Free Swag',
//                     'description': '',
//                     'parentItemCategoryId': 2,
//                     'updatedAt': 1545807545123,
//                     'createdAt': 1543920716250,
//                     'ParentItemCategory': {
//                         'id': 2,
//                         'key': 'cat_particl',
//                         'name': 'Particl',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545092,
//                         'createdAt': 1543920716220,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [],
//                 'ItemLocation': {
//                     'id': 135,
//                     'region': 'AF',
//                     'address': 'a',
//                     'itemInformationId': 136,
//                     'updatedAt': 1544609898636,
//                     'createdAt': 1544609898636,
//                     'LocationMarker': {}
//                 }
//             },
//             'PaymentInformation': {
//                 'id': 130,
//                 'type': 'SALE',
//                 'listingItemId': 135,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544609898651,
//                 'createdAt': 1544609898651,
//                 'Escrow': {
//                     'id': 130,
//                     'type': 'MAD',
//                     'paymentInformationId': 130,
//                     'updatedAt': 1544609898662,
//                     'createdAt': 1544609898662,
//                     'Ratio': {
//                         'id': 130,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 130,
//                         'updatedAt': 1544609898671,
//                         'createdAt': 1544609898671
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 129,
//                     'currency': 'PARTICL',
//                     'basePrice': 21,
//                     'paymentInformationId': 130,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544609898683,
//                     'createdAt': 1544609898683,
//                     'ShippingPrice': {
//                         'id': 129,
//                         'domestic': 2,
//                         'international': 2,
//                         'itemPriceId': 129,
//                         'updatedAt': 1544609898692,
//                         'createdAt': 1544609898692
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 128,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 135,
//                 'updatedAt': 1544609898782,
//                 'createdAt': 1544609898782,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 132,
//                     'actionMessageId': 128,
//                     'dataId': 'seller',
//                     'dataValue': 'pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw',
//                     'updatedAt': 1544609898801,
//                     'createdAt': 1544609898801
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 128,
//                     'actionMessageId': 128,
//                     'msgid': '000000005c10e018ed48d2082852ef501bf4fc695740d30c165b5627',
//                     'version': '0300',
//                     'received': '2018-12-12T10:17:54.000Z',
//                     'sent': '2018-12-12T10:16:56.000Z',
//                     'from': 'pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544609898792,
//                     'createdAt': 1544609898792
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {},
//             'ListingItemTemplate': {
//                 'id': 2,
//                 'hash': 'dd0d07fd8e8c25489d373d84a62d41a2cb8f8c33b890952722a9910669aad28e',
//                 'profileId': 1,
//                 'updatedAt': 1543934205508,
//                 'createdAt': 1543934205508,
//                 'Profile': {
//                     'id': 1,
//                     'name': 'DEFAULT',
//                     'address': 'pZaDrosUWnUfFRYaKvSeRtQCgx5cndi9cw',
//                     'updatedAt': 1543921282742,
//                     'createdAt': 1543920717681
//                 }
//             }
//         }

//     },
//     {
//         'object': {
//             'id': 92,
//             'hash': '6181b7b6c941946ec8be5226f7fd5187a659f3edd7a5ae8e96e91201fad440bc',
//             'seller': 'peLw36VwoKL8GWbg3A5rKGtrze5tX68Kxv',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1544175367000,
//             'postedAt': 1544175298000,
//             'expiredAt': 1546594498000,
//             'updatedAt': 1544175388305,
//             'createdAt': 1544175388305,
//             'ItemInformation': {
//                 'id': 94,
//                 'title': 'Dry Gin',
//                 'shortDescription': 'homemade gin for sale',
//                 'longDescription': 'gin that has been made in the native lands of america,with an alcohol percentage of 100% this will surley get any party started,but bewarned the next morning!',
//                 'itemCategoryId': 52,
//                 'listingItemId': 92,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544175388331,
//                 'createdAt': 1544175388331,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 52,
//                     'key': 'cat_health_diet_nutrition',
//                     'name': 'Diet & Nutrition',
//                     'description': '',
//                     'parentItemCategoryId': 51,
//                     'updatedAt': 1545807545962,
//                     'createdAt': 1543920717237,
//                     'ParentItemCategory': {
//                         'id': 51,
//                         'key': 'cat_health_beauty_personal',
//                         'name': 'Health / Beauty and Personal Care',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545948,
//                         'createdAt': 1543920717225,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 76,
//                     'hash': 'a04e5cb4bd04f7ed6a987138de295604f741f7b88dc624551ebdb1ca339c44a6',
//                     'itemInformationId': 94,
//                     'updatedAt': 1544175388458,
//                     'createdAt': 1544175388458,
//                     'ItemImageDatas': [{
//                         'id': 294,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/76/ORIGINAL',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391268,
//                         'createdAt': 1544175391268,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 295,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/76/LARGE',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391470,
//                         'createdAt': 1544175391470,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 296,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/76/MEDIUM',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391677,
//                         'createdAt': 1544175391677,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 297,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/76/THUMBNAIL',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391846,
//                         'createdAt': 1544175391846,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 93,
//                     'region': 'CR',
//                     'address': 'a',
//                     'itemInformationId': 94,
//                     'updatedAt': 1544175388343,
//                     'createdAt': 1544175388343,
//                     'LocationMarker': {}
//                 }
//             },
//             'PaymentInformation': {
//                 'id': 88,
//                 'type': 'SALE',
//                 'listingItemId': 92,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544175392130,
//                 'createdAt': 1544175392130,
//                 'Escrow': {
//                     'id': 88,
//                     'type': 'MAD',
//                     'paymentInformationId': 88,
//                     'updatedAt': 1544175392144,
//                     'createdAt': 1544175392144,
//                     'Ratio': {
//                         'id': 88,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 88,
//                         'updatedAt': 1544175392151,
//                         'createdAt': 1544175392151
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 87,
//                     'currency': 'PARTICL',
//                     'basePrice': 1,
//                     'paymentInformationId': 88,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544175392160,
//                     'createdAt': 1544175392160,
//                     'ShippingPrice': {
//                         'id': 87,
//                         'domestic': 1,
//                         'international': 1,
//                         'itemPriceId': 87,
//                         'updatedAt': 1544175392167,
//                         'createdAt': 1544175392167
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 84,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 92,
//                 'updatedAt': 1544175392240,
//                 'createdAt': 1544175392240,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 84,
//                     'actionMessageId': 84,
//                     'dataId': 'seller',
//                     'dataValue': 'peLw36VwoKL8GWbg3A5rKGtrze5tX68Kxv',
//                     'updatedAt': 1544175392286,
//                     'createdAt': 1544175392286
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 84,
//                     'actionMessageId': 84,
//                     'msgid': '000000005c0a3ec222d606bccdf21346b1d7b5483361890d97267bbb',
//                     'version': '0300',
//                     'received': '2018-12-07T09:36:07.000Z',
//                     'sent': '2018-12-07T09:34:58.000Z',
//                     'from': 'peLw36VwoKL8GWbg3A5rKGtrze5tX68Kxv',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544175392268,
//                     'createdAt': 1544175392268
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}

//         },
//         'category': {
//             'category': {
//                 'id': 52,
//                 'key': 'cat_health_diet_nutrition',
//                 'name': 'Diet & Nutrition',
//                 'description': '',
//                 'parentItemCategoryId': 51,
//                 'updatedAt': 1545807545962,
//                 'createdAt': 1543920717237,
//                 'ParentItemCategory': {
//                     'id': 51,
//                     'key': 'cat_health_beauty_personal',
//                     'name': 'Health / Beauty and Personal Care',
//                     'description': '',
//                     'parentItemCategoryId': 1,
//                     'updatedAt': 1545807545948,
//                     'createdAt': 1543920717225,
//                     'ParentItemCategory': {
//                         'id': 1,
//                         'key': 'cat_ROOT',
//                         'name': 'ROOT',
//                         'description': 'root item category',
//                         'parentItemCategoryId': null,
//                         'updatedAt': 1545807545055,
//                         'createdAt': 1543920716188
//                     }
//                 }
//             }
//         },
//         'createdAt': '07-12-2018',
//         'status': 'unpublished',
//         'basePrice': {
//             'amount': 1,
//             'maxRoundingDigits': 8
//         },
//         'domesticShippingPrice': {
//             'amount': 1,
//             'maxRoundingDigits': 8
//         },
//         'internationalShippingPrice': {
//             'amount': 1,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceInternational': {
//             'amount': 2,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceDomestic': {
//             'amount': 2,
//             'maxRoundingDigits': 8
//         },
//         'domesticTotal': {
//             'amount': 2,
//             'maxRoundingDigits': 8
//         },
//         'internationalTotal': {
//             'amount': 2,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountInternaltional': {
//             'amount': 4,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountDomestic': {
//             'amount': 4,
//             'maxRoundingDigits': 8
//         },
//         'memo': '',
//         'expireTime': 4,
//         'isFlagged': false,
//         'proposalHash': '',
//         'submitterAddress': '',
//         'imageCollection': {
//             'images': [{
//                 'image': {
//                     'id': 76,
//                     'hash': 'a04e5cb4bd04f7ed6a987138de295604f741f7b88dc624551ebdb1ca339c44a6',
//                     'itemInformationId': 94,
//                     'updatedAt': 1544175388458,
//                     'createdAt': 1544175388458,
//                     'ItemImageDatas': [
//                         {
//                             'id': 294,
//                             'protocol': 'LOCAL',
//                             'encoding': 'BASE64',
//                             'imageVersion': 'ORIGINAL',
//                             'dataId': 'http://localhost:3000/api/item-images/76/ORIGINAL',
//                             'itemImageId': 76,
//                             'updatedAt': 1544175391268,
//                             'createdAt': 1544175391268,
//                             'originalMime': null,
//                             'originalName': null
//                         },
//                         {
//                             'id': 295,
//                             'protocol': 'LOCAL',
//                             'encoding': 'BASE64',
//                             'imageVersion': 'LARGE',
//                             'dataId': 'http://localhost:3000/api/item-images/76/LARGE',
//                             'itemImageId': 76,
//                             'updatedAt': 1544175391470,
//                             'createdAt': 1544175391470,
//                             'originalMime': null,
//                             'originalName': null
//                         },
//                         {
//                             'id': 296,
//                             'protocol': 'LOCAL',
//                             'encoding': 'BASE64',
//                             'imageVersion': 'MEDIUM',
//                             'dataId': 'http://localhost:3000/api/item-images/76/MEDIUM',
//                             'itemImageId': 76,
//                             'updatedAt': 1544175391677,
//                             'createdAt': 1544175391677,
//                             'originalMime': null,
//                             'originalName': null
//                         },
//                         {
//                             'id': 297,
//                             'protocol': 'LOCAL',
//                             'encoding': 'BASE64',
//                             'imageVersion': 'THUMBNAIL',
//                             'dataId': 'http://localhost:3000/api/item-images/76/THUMBNAIL',
//                             'itemImageId': 76,
//                             'updatedAt': 1544175391846,
//                             'createdAt': 1544175391846,
//                             'originalMime': null,
//                             'originalName': null
//                         }]
//                 }
//             }],
//             'default': {
//                 'image': { 'ItemImageDatas': [] }
//             },
//             'imageItems': [{
//                 'data': {
//                     'src': 'http://localhost:3000/api/item-images/76/MEDIUM',
//                     'thumb': 'http://localhost:3000/api/item-images/76/THUMBNAIL'
//                 }
//             }],
//             'preview': {
//                 'image': {
//                     'id': 76,
//                     'hash': 'a04e5cb4bd04f7ed6a987138de295604f741f7b88dc624551ebdb1ca339c44a6',
//                     'itemInformationId': 94,
//                     'updatedAt': 1544175388458,
//                     'createdAt': 1544175388458,
//                     'ItemImageDatas': [{
//                         'id': 294,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/76/ORIGINAL',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391268,
//                         'createdAt': 1544175391268,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 295,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/76/LARGE',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391470,
//                         'createdAt': 1544175391470,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 296,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/76/MEDIUM',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391677,
//                         'createdAt': 1544175391677,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 297,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/76/THUMBNAIL',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391846,
//                         'createdAt': 1544175391846,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }
//             }

//         },
//         'listing': {
//             'id': 92,
//             'hash': '6181b7b6c941946ec8be5226f7fd5187a659f3edd7a5ae8e96e91201fad440bc',
//             'seller': 'peLw36VwoKL8GWbg3A5rKGtrze5tX68Kxv',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1544175367000,
//             'postedAt': 1544175298000,
//             'expiredAt': 1546594498000,
//             'updatedAt': 1544175388305,
//             'createdAt': 1544175388305,
//             'ItemInformation': {
//                 'id': 94,
//                 'title': 'Dry Gin',
//                 'shortDescription': 'homemade gin for sale',
//                 'longDescription': 'gin that has been made in the native lands of america, with an alcohol percentage of 100% this will surley get any party started, but bewarned the next morning!',
//                 'itemCategoryId': 52,
//                 'listingItemId': 92,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544175388331,
//                 'createdAt': 1544175388331,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 52,
//                     'key': 'cat_health_diet_nutrition',
//                     'name': 'Diet & Nutrition',
//                     'description': '',
//                     'parentItemCategoryId': 51,
//                     'updatedAt': 1545807545962,
//                     'createdAt': 1543920717237,
//                     'ParentItemCategory': {
//                         'id': 51,
//                         'key': 'cat_health_beauty_personal',
//                         'name': 'Health / Beauty and Personal Care',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545948,
//                         'createdAt': 1543920717225,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 76,
//                     'hash': 'a04e5cb4bd04f7ed6a987138de295604f741f7b88dc624551ebdb1ca339c44a6',
//                     'itemInformationId': 94,
//                     'updatedAt': 1544175388458,
//                     'createdAt': 1544175388458,
//                     'ItemImageDatas': [{
//                         'id': 294,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/76/ORIGINAL',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391268,
//                         'createdAt': 1544175391268,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 295,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/76/LARGE',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391470,
//                         'createdAt': 1544175391470,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 296,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/76/MEDIUM',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391677,
//                         'createdAt': 1544175391677,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 297,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/76/THUMBNAIL',
//                         'itemImageId': 76,
//                         'updatedAt': 1544175391846,
//                         'createdAt': 1544175391846,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 93,
//                     'region': 'CR',
//                     'address': 'a',
//                     'itemInformationId': 94,
//                     'updatedAt': 1544175388343,
//                     'createdAt': 1544175388343,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 88,
//                 'type': 'SALE',
//                 'listingItemId': 92,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544175392130,
//                 'createdAt': 1544175392130,
//                 'Escrow': {
//                     'id': 88,
//                     'type': 'MAD',
//                     'paymentInformationId': 88,
//                     'updatedAt': 1544175392144,
//                     'createdAt': 1544175392144,
//                     'Ratio': {
//                         'id': 88,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 88,
//                         'updatedAt': 1544175392151,
//                         'createdAt': 1544175392151
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 87,
//                     'currency': 'PARTICL',
//                     'basePrice': 1,
//                     'paymentInformationId': 88,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544175392160,
//                     'createdAt': 1544175392160,
//                     'ShippingPrice': {
//                         'id': 87,
//                         'domestic': 1,
//                         'international': 1,
//                         'itemPriceId': 87,
//                         'updatedAt': 1544175392167,
//                         'createdAt': 1544175392167
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 84,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 92,
//                 'updatedAt': 1544175392240,
//                 'createdAt': 1544175392240,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 84,
//                     'actionMessageId': 84,
//                     'dataId': 'seller',
//                     'dataValue': 'peLw36VwoKL8GWbg3A5rKGtrze5tX68Kxv',
//                     'updatedAt': 1544175392286,
//                     'createdAt': 1544175392286
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 84,
//                     'actionMessageId': 84,
//                     'msgid': '000000005c0a3ec222d606bccdf21346b1d7b5483361890d97267bbb',
//                     'version': '0300',
//                     'received': '2018-12-07T09:36:07.000Z',
//                     'sent': '2018-12-07T09:34:58.000Z',
//                     'from': 'peLw36VwoKL8GWbg3A5rKGtrze5tX68Kxv',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544175392268,
//                     'createdAt': 1544175392268
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}
//         }

//     },
//     {
//         'object': {
//             'id': 88,
//             'hash': 'e04467afe0b451347dce1229ba1bd7b3e686adbb13ddcf50743679dadd9dbc31',
//             'seller': 'pk1tqjyV53nSZ1X1rdtvvqCeUXNf4o6Dkr',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1544175276000,
//             'postedAt': 1544130889000,
//             'expiredAt': 1546550089000,
//             'updatedAt': 1544175312707,
//             'createdAt': 1544175312707,
//             'ItemInformation': {
//                 'id': 90,
//                 'title': 'best particl shirt ',
//                 'shortDescription': 'should have won shirt contest',
//                 'longDescription': 'real stuff, real money only',
//                 'itemCategoryId': 3,
//                 'listingItemId': 88,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544175312728,
//                 'createdAt': 1544175312728,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 3,
//                     'key': 'cat_particl_free_swag',
//                     'name': 'Free Swag',
//                     'description': '',
//                     'parentItemCategoryId': 2,
//                     'updatedAt': 1545807545123,
//                     'createdAt': 1543920716250,
//                     'ParentItemCategory': {
//                         'id': 2,
//                         'key': 'cat_particl',
//                         'name': 'Particl',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545092,
//                         'createdAt': 1543920716220,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 72,
//                     'hash': '8f5979c1f3b0b9e93c6c1e3b60dc49a37a0525877cb54092a91b910efa3a50ed',
//                     'itemInformationId': 90,
//                     'updatedAt': 1544175312796,
//                     'createdAt': 1544175312796,
//                     'ItemImageDatas': [{
//                         'id': 278,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/72/ORIGINAL',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317413,
//                         'createdAt': 1544175317413,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 279,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/72/LARGE',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317600,
//                         'createdAt': 1544175317600,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 280,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/72/MEDIUM',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317800,
//                         'createdAt': 1544175317800,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 282,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/72/THUMBNAIL',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175321988,
//                         'createdAt': 1544175321988,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 89,
//                     'region': 'AD',
//                     'address': 'a',
//                     'itemInformationId': 90,
//                     'updatedAt': 1544175312736,
//                     'createdAt': 1544175312736,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 84,
//                 'type': 'SALE',
//                 'listingItemId': 88,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544175322368,
//                 'createdAt': 1544175322368,
//                 'Escrow': {
//                     'id': 84,
//                     'type': 'MAD',
//                     'paymentInformationId': 84,
//                     'updatedAt': 1544175322387,
//                     'createdAt': 1544175322387,
//                     'Ratio': {
//                         'id': 84,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 84,
//                         'updatedAt': 1544175322403,
//                         'createdAt': 1544175322403
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 83,
//                     'currency': 'PARTICL',
//                     'basePrice': 10,
//                     'paymentInformationId': 84,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544175324595,
//                     'createdAt': 1544175324595,
//                     'ShippingPrice': {
//                         'id': 83,
//                         'domestic': 1,
//                         'international': 1,
//                         'itemPriceId': 83,
//                         'updatedAt': 1544175324610,
//                         'createdAt': 1544175324610
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 80,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 88,
//                 'updatedAt': 1544175324717,
//                 'createdAt': 1544175324717,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 80,
//                     'actionMessageId': 80,
//                     'dataId': 'seller',
//                     'dataValue': 'pk1tqjyV53nSZ1X1rdtvvqCeUXNf4o6Dkr',
//                     'updatedAt': 1544175324741,
//                     'createdAt': 1544175324741
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 80,
//                     'actionMessageId': 80,
//                     'msgid': '000000005c099149e4b57216cc65c0abea7ce25049c28006439bfe8c',
//                     'version': '0300',
//                     'received': '2018-12-07T09:34:36.000Z',
//                     'sent': '2018-12-06T21:14:49.000Z',
//                     'from': 'pk1tqjyV53nSZ1X1rdtvvqCeUXNf4o6Dkr',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544175324734,
//                     'createdAt': 1544175324734
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}

//         },
//         'category': {
//             'category': {
//                 'id': 3,
//                 'key': 'cat_particl_free_swag',
//                 'name': 'Free Swag',
//                 'description': '',
//                 'parentItemCategoryId': 2,
//                 'updatedAt': 1545807545123,
//                 'createdAt': 1543920716250,
//                 'ParentItemCategory': {
//                     'id': 2,
//                     'key': 'cat_particl',
//                     'name': 'Particl',
//                     'description': '',
//                     'parentItemCategoryId': 1,
//                     'updatedAt': 1545807545092,
//                     'createdAt': 1543920716220,
//                     'ParentItemCategory': {
//                         'id': 1,
//                         'key': 'cat_ROOT',
//                         'name': 'ROOT',
//                         'description': 'root item category',
//                         'parentItemCategoryId': null,
//                         'updatedAt': 1545807545055,
//                         'createdAt': 1543920716188
//                     }
//                 }
//             }
//         },
//         'createdAt': '07-12-2018',
//         'status': 'unpublished',
//         'basePrice': {
//             'amount': 10,
//             'maxRoundingDigits': 8
//         },
//         'domesticShippingPrice': {
//             'amount': 1,
//             'maxRoundingDigits': 8
//         },
//         'internationalShippingPrice': {
//             'amount': 1,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceInternational': {
//             'amount': 11,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceDomestic': {
//             'amount': 11,
//             'maxRoundingDigits': 8
//         },
//         'domesticTotal': {
//             'amount': 11,
//             'maxRoundingDigits': 8
//         },
//         'internationalTotal': {
//             'amount': 11,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountInternaltional': {
//             'amount': 22,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountDomestic': {
//             'amount': 22,
//             'maxRoundingDigits': 8
//         },
//         'memo': '',
//         'expireTime': 4,
//         'isFlagged': false,
//         'proposalHash': '',
//         'submitterAddress': '',
//         'imageCollection': {
//             'images': [{
//                 'image': {
//                     'id': 72,
//                     'hash': '8f5979c1f3b0b9e93c6c1e3b60dc49a37a0525877cb54092a91b910efa3a50ed',
//                     'itemInformationId': 90,
//                     'updatedAt': 1544175312796,
//                     'createdAt': 1544175312796,
//                     'ItemImageDatas': [{
//                         'id': 278,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/72/ORIGINAL',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317413,
//                         'createdAt': 1544175317413,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 279,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/72/LARGE',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317600,
//                         'createdAt': 1544175317600,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 280,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/72/MEDIUM',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317800,
//                         'createdAt': 1544175317800,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 282,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/72/THUMBNAIL',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175321988,
//                         'createdAt': 1544175321988,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }
//             }],
//             'default': {
//                 'image': { 'ItemImageDatas': [] }
//             },
//             'imageItems': [{
//                 'data': {
//                     'src': 'http://localhost:3000/api/item-images/72/MEDIUM',
//                     'thumb': 'http://localhost:3000/api/item-images/72/THUMBNAIL'
//                 }
//             }],
//             'preview': {
//                 'image': {
//                     'id': 72,
//                     'hash': '8f5979c1f3b0b9e93c6c1e3b60dc49a37a0525877cb54092a91b910efa3a50ed',
//                     'itemInformationId': 90,
//                     'updatedAt': 1544175312796,
//                     'createdAt': 1544175312796,
//                     'ItemImageDatas': [{
//                         'id': 278,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/72/ORIGINAL',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317413,
//                         'createdAt': 1544175317413,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 279,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/72/LARGE',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317600,
//                         'createdAt': 1544175317600,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 280,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/72/MEDIUM',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317800,
//                         'createdAt': 1544175317800,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 282,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/72/THUMBNAIL',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175321988,
//                         'createdAt': 1544175321988,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }
//             }

//         },
//         'listing': {
//             'id': 88,
//             'hash': 'e04467afe0b451347dce1229ba1bd7b3e686adbb13ddcf50743679dadd9dbc31',
//             'seller': 'pk1tqjyV53nSZ1X1rdtvvqCeUXNf4o6Dkr',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1544175276000,
//             'postedAt': 1544130889000,
//             'expiredAt': 1546550089000,
//             'updatedAt': 1544175312707,
//             'createdAt': 1544175312707,
//             'ItemInformation': {
//                 'id': 90,
//                 'title': 'best particl shirt ',
//                 'shortDescription': 'should have won shirt contest',
//                 'longDescription': 'real stuff, real money only',
//                 'itemCategoryId': 3,
//                 'listingItemId': 88,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544175312728,
//                 'createdAt': 1544175312728,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 3,
//                     'key': 'cat_particl_free_swag',
//                     'name': 'Free Swag',
//                     'description': '',
//                     'parentItemCategoryId': 2,
//                     'updatedAt': 1545807545123,
//                     'createdAt': 1543920716250,
//                     'ParentItemCategory': {
//                         'id': 2,
//                         'key': 'cat_particl',
//                         'name': 'Particl',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545092,
//                         'createdAt': 1543920716220,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 72,
//                     'hash': '8f5979c1f3b0b9e93c6c1e3b60dc49a37a0525877cb54092a91b910efa3a50ed',
//                     'itemInformationId': 90,
//                     'updatedAt': 1544175312796,
//                     'createdAt': 1544175312796,
//                     'ItemImageDatas': [{
//                         'id': 278,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/72/ORIGINAL',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317413,
//                         'createdAt': 1544175317413,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 279,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/72/LARGE',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317600,
//                         'createdAt': 1544175317600,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 280,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/72/MEDIUM',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175317800,
//                         'createdAt': 1544175317800,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 282,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/72/THUMBNAIL',
//                         'itemImageId': 72,
//                         'updatedAt': 1544175321988,
//                         'createdAt': 1544175321988,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 89,
//                     'region': 'AD',
//                     'address': 'a',
//                     'itemInformationId': 90,
//                     'updatedAt': 1544175312736,
//                     'createdAt': 1544175312736,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 84,
//                 'type': 'SALE',
//                 'listingItemId': 88,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544175322368,
//                 'createdAt': 1544175322368,
//                 'Escrow': {
//                     'id': 84,
//                     'type': 'MAD',
//                     'paymentInformationId': 84,
//                     'updatedAt': 1544175322387,
//                     'createdAt': 1544175322387,
//                     'Ratio': {
//                         'id': 84,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 84,
//                         'updatedAt': 1544175322403,
//                         'createdAt': 1544175322403
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 83,
//                     'currency': 'PARTICL',
//                     'basePrice': 10,
//                     'paymentInformationId': 84,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544175324595,
//                     'createdAt': 1544175324595,
//                     'ShippingPrice': {
//                         'id': 83,
//                         'domestic': 1,
//                         'international': 1,
//                         'itemPriceId': 83,
//                         'updatedAt': 1544175324610,
//                         'createdAt': 1544175324610
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 80,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 88,
//                 'updatedAt': 1544175324717,
//                 'createdAt': 1544175324717,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 80,
//                     'actionMessageId': 80,
//                     'dataId': 'seller',
//                     'dataValue': 'pk1tqjyV53nSZ1X1rdtvvqCeUXNf4o6Dkr',
//                     'updatedAt': 1544175324741,
//                     'createdAt': 1544175324741
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 80,
//                     'actionMessageId': 80,
//                     'msgid': '000000005c099149e4b57216cc65c0abea7ce25049c28006439bfe8c',
//                     'version': '0300',
//                     'received': '2018-12-07T09:34:36.000Z',
//                     'sent': '2018-12-06T21:14:49.000Z',
//                     'from': 'pk1tqjyV53nSZ1X1rdtvvqCeUXNf4o6Dkr',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544175324734,
//                     'createdAt': 1544175324734
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}
//         }

//     },
//     {
//         'object': {
//             'id': 55,
//             'hash': 'b7953b85bbaef16b5d1e6e244e6676a95b649dd6a68128e114b8f5aed2096917',
//             'seller': 'pW7S91FVh6adBiR7DRVzVYk5qdkRh64KR3',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1544021188000,
//             'postedAt': 1543943894000,
//             'expiredAt': 1546363094000,
//             'updatedAt': 1544021434609,
//             'createdAt': 1544021434609,
//             'ItemInformation': {
//                 'id': 57,
//                 'title': 'Custom Particl Lapel Pin - ICOsensei',
//                 'shortDescription': 'Custom Particl Logo Lapel Pin from ICOsensei',
//                 'longDescription': 'Our friends at ICOsensei are big supporters of the concept of a private, decentralized marketplace and have made it known that they have big plans once we release Particl Marketplace on mainnet. \n\n----\n\nEarlier in the summer, they sent over a limited supply of Particl branded lapel pins from their very own collection.\n\n----\n\nSupply is limited, please keep it at 1 per customer :)',
//                 'itemCategoryId': 3,
//                 'listingItemId': 55,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544021434709,
//                 'createdAt': 1544021434709,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 3,
//                     'key': 'cat_particl_free_swag',
//                     'name': 'Free Swag',
//                     'description': '',
//                     'parentItemCategoryId': 2,
//                     'updatedAt': 1545807545123,
//                     'createdAt': 1543920716250,
//                     'ParentItemCategory': {
//                         'id': 2,
//                         'key': 'cat_particl',
//                         'name': 'Particl',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545092,
//                         'createdAt': 1543920716220,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 51,
//                     'hash': '7ae4dfe2ddff9f552e7e42165eb74a4a9fc93d020b8af8fb9102147ab2a93020',
//                     'itemInformationId': 57,
//                     'updatedAt': 1544021464573,
//                     'createdAt': 1544021464573,
//                     'ItemImageDatas': [{
//                         'id': 193,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/51/ORIGINAL',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021484258,
//                         'createdAt': 1544021484258,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 195,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/51/LARGE',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021484634,
//                         'createdAt': 1544021484634,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 197,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/51/MEDIUM',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021485004,
//                         'createdAt': 1544021485004,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 199,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/51/THUMBNAIL',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021486169,
//                         'createdAt': 1544021486169,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 56,
//                     'region': 'US',
//                     'address': 'a',
//                     'itemInformationId': 57,
//                     'updatedAt': 1544021450327,
//                     'createdAt': 1544021450327,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 54,
//                 'type': 'SALE',
//                 'listingItemId': 55,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544021486349,
//                 'createdAt': 1544021486349,
//                 'Escrow': {
//                     'id': 54,
//                     'type': 'MAD',
//                     'paymentInformationId': 54,
//                     'updatedAt': 1544021486362,
//                     'createdAt': 1544021486362,
//                     'Ratio': {
//                         'id': 54,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 54,
//                         'updatedAt': 1544021486370,
//                         'createdAt': 1544021486370
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 54,
//                     'currency': 'PARTICL',
//                     'basePrice': 5,
//                     'paymentInformationId': 54,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544021486382,
//                     'createdAt': 1544021486382,
//                     'ShippingPrice': {
//                         'id': 54,
//                         'domestic': 0,
//                         'international': 0,
//                         'itemPriceId': 54,
//                         'updatedAt': 1544021486389,
//                         'createdAt': 1544021486389
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 52,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 55,
//                 'updatedAt': 1544021486427,
//                 'createdAt': 1544021486427,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 52,
//                     'actionMessageId': 52,
//                     'dataId': 'seller',
//                     'dataValue': 'pW7S91FVh6adBiR7DRVzVYk5qdkRh64KR3',
//                     'updatedAt': 1544021486441,
//                     'createdAt': 1544021486441
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 52,
//                     'actionMessageId': 52,
//                     'msgid': '000000005c06b6d6a602b9023ed42252c50a1b22771fbb4657aeb860',
//                     'version': '0300',
//                     'received': '2018-12-05T14:46:28.000Z',
//                     'sent': '2018-12-04T17:18:14.000Z',
//                     'from': 'pW7S91FVh6adBiR7DRVzVYk5qdkRh64KR3',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544021486435,
//                     'createdAt': 1544021486435
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}

//         },
//         'category': {
//             'category': {
//                 'id': 3,
//                 'key': 'cat_particl_free_swag',
//                 'name': 'Free Swag',
//                 'description': '',
//                 'parentItemCategoryId': 2,
//                 'updatedAt': 1545807545123,
//                 'createdAt': 1543920716250,
//                 'ParentItemCategory': {
//                     'id': 2,
//                     'key': 'cat_particl',
//                     'name': 'Particl',
//                     'description': '',
//                     'parentItemCategoryId': 1,
//                     'updatedAt': 1545807545092,
//                     'createdAt': 1543920716220,
//                     'ParentItemCategory': {
//                         'id': 1,
//                         'key': 'cat_ROOT',
//                         'name': 'ROOT',
//                         'description': 'root item category',
//                         'parentItemCategoryId': null,
//                         'updatedAt': 1545807545055,
//                         'createdAt': 1543920716188
//                     }
//                 }
//             }
//         },
//         'createdAt': '05-12-2018',
//         'status': 'unpublished',
//         'basePrice': {
//             'amount': 5,
//             'maxRoundingDigits': 8
//         },
//         'domesticShippingPrice': {
//             'amount': 0,
//             'maxRoundingDigits': 8
//         },
//         'internationalShippingPrice': {
//             'amount': 0,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceInternational': {
//             'amount': 5,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceDomestic': {
//             'amount': 5,
//             'maxRoundingDigits': 8
//         },
//         'domesticTotal': {
//             'amount': 5,
//             'maxRoundingDigits': 8
//         },
//         'internationalTotal': {
//             'amount': 5,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountInternaltional': {
//             'amount': 10,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountDomestic': {
//             'amount': 10,
//             'maxRoundingDigits': 8
//         },
//         'memo': '',
//         'expireTime': 4,
//         'isFlagged': false,
//         'proposalHash': '',
//         'submitterAddress': '',
//         'imageCollection': {
//             'images': [{
//                 'image': {
//                     'id': 51,
//                     'hash': '7ae4dfe2ddff9f552e7e42165eb74a4a9fc93d020b8af8fb9102147ab2a93020',
//                     'itemInformationId': 57,
//                     'updatedAt': 1544021464573,
//                     'createdAt': 1544021464573,
//                     'ItemImageDatas': [{
//                         'id': 193,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/51/ORIGINAL',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021484258,
//                         'createdAt': 1544021484258,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 195,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/51/LARGE',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021484634,
//                         'createdAt': 1544021484634,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 197,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/51/MEDIUM',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021485004,
//                         'createdAt': 1544021485004,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 199,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/51/THUMBNAIL',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021486169,
//                         'createdAt': 1544021486169,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }
//             }],
//             'default': {
//                 'image': { 'ItemImageDatas': [] }
//             },
//             'imageItems': [{
//                 'data': {
//                     'src': 'http://localhost:3000/api/item-images/51/MEDIUM',
//                     'thumb': 'http://localhost:3000/api/item-images/51/THUMBNAIL'
//                 }
//             }],
//             'preview': {
//                 'image': {
//                     'id': 51,
//                     'hash': '7ae4dfe2ddff9f552e7e42165eb74a4a9fc93d020b8af8fb9102147ab2a93020',
//                     'itemInformationId': 57,
//                     'updatedAt': 1544021464573,
//                     'createdAt': 1544021464573,
//                     'ItemImageDatas': [{
//                         'id': 193,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/51/ORIGINAL',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021484258,
//                         'createdAt': 1544021484258,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 195,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/51/LARGE',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021484634,
//                         'createdAt': 1544021484634,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 197,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/51/MEDIUM',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021485004,
//                         'createdAt': 1544021485004,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 199,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/51/THUMBNAIL',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021486169,
//                         'createdAt': 1544021486169,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }
//             }

//         },
//         'listing': {
//             'id': 55,
//             'hash': 'b7953b85bbaef16b5d1e6e244e6676a95b649dd6a68128e114b8f5aed2096917',
//             'seller': 'pW7S91FVh6adBiR7DRVzVYk5qdkRh64KR3',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1544021188000,
//             'postedAt': 1543943894000,
//             'expiredAt': 1546363094000,
//             'updatedAt': 1544021434609,
//             'createdAt': 1544021434609,
//             'ItemInformation': {
//                 'id': 57,
//                 'title': 'Custom Particl Lapel Pin - ICOsensei',
//                 'shortDescription': 'Custom Particl Logo Lapel Pin from ICOsensei',
//                 'longDescription': 'Our friends at ICOsensei are big supporters of the concept of a private, decentralized marketplace and have made it known that they have big plans once we release Particl Marketplace on mainnet. \n\n----\n\nEarlier in the summer, they sent over a limited supply of Particl branded lapel pins from their very own collection.\n\n----\n\nSupply is limited, please keep it at 1 per customer :)',
//                 'itemCategoryId': 3,
//                 'listingItemId': 55,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544021434709,
//                 'createdAt': 1544021434709,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 3,
//                     'key': 'cat_particl_free_swag',
//                     'name': 'Free Swag',
//                     'description': '',
//                     'parentItemCategoryId': 2,
//                     'updatedAt': 1545807545123,
//                     'createdAt': 1543920716250,
//                     'ParentItemCategory': {
//                         'id': 2,
//                         'key': 'cat_particl',
//                         'name': 'Particl',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545092,
//                         'createdAt': 1543920716220,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 51,
//                     'hash': '7ae4dfe2ddff9f552e7e42165eb74a4a9fc93d020b8af8fb9102147ab2a93020',
//                     'itemInformationId': 57,
//                     'updatedAt': 1544021464573,
//                     'createdAt': 1544021464573,
//                     'ItemImageDatas': [{
//                         'id': 193,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/51/ORIGINAL',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021484258,
//                         'createdAt': 1544021484258,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 195,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/51/LARGE',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021484634,
//                         'createdAt': 1544021484634,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 197,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/51/MEDIUM',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021485004,
//                         'createdAt': 1544021485004,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 199,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/51/THUMBNAIL',
//                         'itemImageId': 51,
//                         'updatedAt': 1544021486169,
//                         'createdAt': 1544021486169,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 56,
//                     'region': 'US',
//                     'address': 'a',
//                     'itemInformationId': 57,
//                     'updatedAt': 1544021450327,
//                     'createdAt': 1544021450327,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 54,
//                 'type': 'SALE',
//                 'listingItemId': 55,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544021486349,
//                 'createdAt': 1544021486349,
//                 'Escrow': {
//                     'id': 54,
//                     'type': 'MAD',
//                     'paymentInformationId': 54,
//                     'updatedAt': 1544021486362,
//                     'createdAt': 1544021486362,
//                     'Ratio': {
//                         'id': 54,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 54,
//                         'updatedAt': 1544021486370,
//                         'createdAt': 1544021486370
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 54,
//                     'currency': 'PARTICL',
//                     'basePrice': 5,
//                     'paymentInformationId': 54,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544021486382,
//                     'createdAt': 1544021486382,
//                     'ShippingPrice': {
//                         'id': 54,
//                         'domestic': 0,
//                         'international': 0,
//                         'itemPriceId': 54,
//                         'updatedAt': 1544021486389,
//                         'createdAt': 1544021486389
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 52,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 55,
//                 'updatedAt': 1544021486427,
//                 'createdAt': 1544021486427,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 52,
//                     'actionMessageId': 52,
//                     'dataId': 'seller',
//                     'dataValue': 'pW7S91FVh6adBiR7DRVzVYk5qdkRh64KR3',
//                     'updatedAt': 1544021486441,
//                     'createdAt': 1544021486441
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 52,
//                     'actionMessageId': 52,
//                     'msgid': '000000005c06b6d6a602b9023ed42252c50a1b22771fbb4657aeb860',
//                     'version': '0300',
//                     'received': '2018-12-05T14:46:28.000Z',
//                     'sent': '2018-12-04T17:18:14.000Z',
//                     'from': 'pW7S91FVh6adBiR7DRVzVYk5qdkRh64KR3',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544021486435,
//                     'createdAt': 1544021486435
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}
//         }

//     },
//     {
//         'object': {
//             'id': 54,
//             'hash': 'd8f8f3076a090000842b3d611bfdd19990660a85c0ed9142d946f9f82d4939f7',
//             'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1544021188000,
//             'postedAt': 1543941893000,
//             'expiredAt': 1546361093000,
//             'updatedAt': 1544021417753,
//             'createdAt': 1544021417753,
//             'ItemInformation': {
//                 'id': 56,
//                 'title': 'Lamborghini Pura SV',
//                 'shortDescription': 'Lamborghini Pura SV Is A Sleek, Stunning Look At Lambo\'s Future',
//                 'longDescription': 'We LOVE cryptocurrency and in particular Particl. \n\nTo celebrate we offer you: \n\nOnly on Particl Marketplace 9999% discount for brand new lamborghini. \n\nATTENTION ONLY: 10 available! \n\nItaly \n',
//                 'itemCategoryId': 6,
//                 'listingItemId': 54,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544021417770,
//                 'createdAt': 1544021417770,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 6,
//                     'key': 'cat_high_vehicles_aircraft_yachts',
//                     'name': 'Vehicles / Aircraft / Yachts and Water Craft',
//                     'description': '',
//                     'parentItemCategoryId': 4,
//                     'updatedAt': 1545807545198,
//                     'createdAt': 1543920716336,
//                     'ParentItemCategory': {
//                         'id': 4,
//                         'key': 'cat_high_value',
//                         'name': 'High Value (10,000$+)',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545147,
//                         'createdAt': 1543920716291,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 48,
//                     'hash': '603738e0dee65deb63f03f0ee5ae1691d5adb03c6f7497c2bd56201867d523dc',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021417847,
//                     'createdAt': 1544021417847,
//                     'ItemImageDatas': [{
//                         'id': 180,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/48/ORIGINAL',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434400,
//                         'createdAt': 1544021434400,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 183,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/48/LARGE',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434637,
//                         'createdAt': 1544021434637,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 185,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/48/MEDIUM',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434925,
//                         'createdAt': 1544021434925,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 187,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/48/THUMBNAIL',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021435075,
//                         'createdAt': 1544021435075,
//                         'originalMime': null,
//                         'originalName': null
//                     }]

//                 },
//                 {
//                     'id': 49,
//                     'hash': '10db9386db9377c4227cda53e4b1abc3c49f0ea57770add1b3f9bb912d97d9e6',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021435326,
//                     'createdAt': 1544021435326,
//                     'ItemImageDatas': [{
//                         'id': 188,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/49/ORIGINAL',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450309,
//                         'createdAt': 1544021450309,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 189,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/49/LARGE',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450489,
//                         'createdAt': 1544021450489,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 190,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/49/MEDIUM',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450607,
//                         'createdAt': 1544021450607,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 191,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/49/THUMBNAIL',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450704,
//                         'createdAt': 1544021450704,
//                         'originalMime': null,
//                         'originalName': null
//                     }]

//                 },
//                 {
//                     'id': 50,
//                     'hash': '5192a3dfc9b00f0afaf83d2848df3f9b60a57c07841e317e522a72f502f63cb2',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021450864,
//                     'createdAt': 1544021450864,
//                     'ItemImageDatas': [{
//                         'id': 192,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/50/ORIGINAL',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021464512,
//                         'createdAt': 1544021464512,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 194,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/50/LARGE',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021484485,
//                         'createdAt': 1544021484485,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 196,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/50/MEDIUM',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021484805,
//                         'createdAt': 1544021484805,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 198,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/50/THUMBNAIL',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021485147,
//                         'createdAt': 1544021485147,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 55,
//                     'region': 'IT',
//                     'address': 'a',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021417801,
//                     'createdAt': 1544021417801,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 53,
//                 'type': 'SALE',
//                 'listingItemId': 54,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544021485341,
//                 'createdAt': 1544021485341,
//                 'Escrow': {
//                     'id': 53,
//                     'type': 'MAD',
//                     'paymentInformationId': 53,
//                     'updatedAt': 1544021485352,
//                     'createdAt': 1544021485352,
//                     'Ratio': {
//                         'id': 53,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 53,
//                         'updatedAt': 1544021485357,
//                         'createdAt': 1544021485357
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 53,
//                     'currency': 'PARTICL',
//                     'basePrice': 1,
//                     'paymentInformationId': 53,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544021485365,
//                     'createdAt': 1544021485365,
//                     'ShippingPrice': {
//                         'id': 53,
//                         'domestic': 0.1,
//                         'international': 0.2,
//                         'itemPriceId': 53,
//                         'updatedAt': 1544021485370,
//                         'createdAt': 1544021485370
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 51,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 54,
//                 'updatedAt': 1544021485413,
//                 'createdAt': 1544021485413,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 51,
//                     'actionMessageId': 51,
//                     'dataId': 'seller',
//                     'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                     'updatedAt': 1544021485435,
//                     'createdAt': 1544021485435
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 51,
//                     'actionMessageId': 51,
//                     'msgid': '000000005c06af05cb210c93b47f40ab998d6dc593b28b15e9d9d36d',
//                     'version': '0300',
//                     'received': '2018-12-05T14:46:28.000Z',
//                     'sent': '2018-12-04T16:44:53.000Z',
//                     'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544021485423,
//                     'createdAt': 1544021485423
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}

//         },
//         'category': {
//             'category': {
//                 'id': 6,
//                 'key': 'cat_high_vehicles_aircraft_yachts',
//                 'name': 'Vehicles / Aircraft / Yachts and Water Craft',
//                 'description': '',
//                 'parentItemCategoryId': 4,
//                 'updatedAt': 1545807545198,
//                 'createdAt': 1543920716336,
//                 'ParentItemCategory': {
//                     'id': 4,
//                     'key': 'cat_high_value',
//                     'name': 'High Value (10,000$+)',
//                     'description': '',
//                     'parentItemCategoryId': 1,
//                     'updatedAt': 1545807545147,
//                     'createdAt': 1543920716291,
//                     'ParentItemCategory': {
//                         'id': 1,
//                         'key': 'cat_ROOT',
//                         'name': 'ROOT',
//                         'description': 'root item category',
//                         'parentItemCategoryId': null,
//                         'updatedAt': 1545807545055,
//                         'createdAt': 1543920716188
//                     }
//                 }
//             }
//         },
//         'createdAt': '05-12-2018',
//         'status': 'unpublished',
//         'basePrice': {
//             'amount': 1,
//             'maxRoundingDigits': 8
//         },
//         'domesticShippingPrice': {
//             'amount': 0.1,
//             'maxRoundingDigits': 8
//         },
//         'internationalShippingPrice': {
//             'amount': 0.2,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceInternational': {
//             'amount': 1.2,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceDomestic': {
//             'amount': 1.1,
//             'maxRoundingDigits': 8
//         },
//         'domesticTotal': {
//             'amount': 1.1,
//             'maxRoundingDigits': 8
//         },
//         'internationalTotal': {
//             'amount': 1.2,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountInternaltional': {
//             'amount': 2.4,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountDomestic': {
//             'amount': 2.2,
//             'maxRoundingDigits': 8
//         },
//         'memo': '',
//         'expireTime': 4,
//         'isFlagged': false,
//         'proposalHash': '',
//         'submitterAddress': '',
//         'imageCollection': {
//             'images': [{
//                 'image': {
//                     'id': 48,
//                     'hash': '603738e0dee65deb63f03f0ee5ae1691d5adb03c6f7497c2bd56201867d523dc',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021417847,
//                     'createdAt': 1544021417847,
//                     'ItemImageDatas': [{
//                         'id': 180,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/48/ORIGINAL',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434400,
//                         'createdAt': 1544021434400,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 183,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/48/LARGE',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434637,
//                         'createdAt': 1544021434637,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 185,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/48/MEDIUM',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434925,
//                         'createdAt': 1544021434925,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 187,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/48/THUMBNAIL',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021435075,
//                         'createdAt': 1544021435075,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }

//             },
//             {
//                 'image': {
//                     'id': 49,
//                     'hash': '10db9386db9377c4227cda53e4b1abc3c49f0ea57770add1b3f9bb912d97d9e6',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021435326,
//                     'createdAt': 1544021435326,
//                     'ItemImageDatas': [{
//                         'id': 188,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/49/ORIGINAL',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450309,
//                         'createdAt': 1544021450309,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 189,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/49/LARGE',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450489,
//                         'createdAt': 1544021450489,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 190,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/49/MEDIUM',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450607,
//                         'createdAt': 1544021450607,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 191,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/49/THUMBNAIL',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450704,
//                         'createdAt': 1544021450704,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }

//             },
//             {
//                 'image': {
//                     'id': 50,
//                     'hash': '5192a3dfc9b00f0afaf83d2848df3f9b60a57c07841e317e522a72f502f63cb2',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021450864,
//                     'createdAt': 1544021450864,
//                     'ItemImageDatas': [{
//                         'id': 192,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/50/ORIGINAL',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021464512,
//                         'createdAt': 1544021464512,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 194,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/50/LARGE',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021484485,
//                         'createdAt': 1544021484485,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 196,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/50/MEDIUM',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021484805,
//                         'createdAt': 1544021484805,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 198,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/50/THUMBNAIL',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021485147,
//                         'createdAt': 1544021485147,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }
//             }],
//             'default': {
//                 'image': { 'ItemImageDatas': [] }
//             },
//             'imageItems': [{
//                 'data': {
//                     'src': 'http://localhost:3000/api/item-images/48/MEDIUM',
//                     'thumb': 'http://localhost:3000/api/item-images/48/THUMBNAIL'
//                 }
//             },
//             {
//                 'data': {
//                     'src': 'http://localhost:3000/api/item-images/49/MEDIUM',
//                     'thumb': 'http://localhost:3000/api/item-images/49/THUMBNAIL'
//                 }
//             },
//             {
//                 'data': {
//                     'src': 'http://localhost:3000/api/item-images/50/MEDIUM',
//                     'thumb': 'http://localhost:3000/api/item-images/50/THUMBNAIL'
//                 }
//             }],
//             'preview': {
//                 'image': {
//                     'id': 48,
//                     'hash': '603738e0dee65deb63f03f0ee5ae1691d5adb03c6f7497c2bd56201867d523dc',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021417847,
//                     'createdAt': 1544021417847,
//                     'ItemImageDatas': [{
//                         'id': 180,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/48/ORIGINAL',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434400,
//                         'createdAt': 1544021434400,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 183,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/48/LARGE',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434637,
//                         'createdAt': 1544021434637,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 185,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/48/MEDIUM',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434925,
//                         'createdAt': 1544021434925,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 187,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/48/THUMBNAIL',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021435075,
//                         'createdAt': 1544021435075,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }
//             }

//         },
//         'listing': {
//             'id': 54,
//             'hash': 'd8f8f3076a090000842b3d611bfdd19990660a85c0ed9142d946f9f82d4939f7',
//             'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1544021188000,
//             'postedAt': 1543941893000,
//             'expiredAt': 1546361093000,
//             'updatedAt': 1544021417753,
//             'createdAt': 1544021417753,
//             'ItemInformation': {
//                 'id': 56,
//                 'title': 'Lamborghini Pura SV',
//                 'shortDescription': 'Lamborghini Pura SV Is A Sleek, Stunning Look At Lambo\'s Future',
//                 'longDescription': 'We LOVE cryptocurrency and in particular Particl. \n\nTo celebrate we offer you: \n\nOnly on Particl Marketplace 9999% discount for brand new lamborghini. \n\nATTENTION ONLY: 10 available! \n\nItaly \n',
//                 'itemCategoryId': 6,
//                 'listingItemId': 54,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544021417770,
//                 'createdAt': 1544021417770,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 6,
//                     'key': 'cat_high_vehicles_aircraft_yachts',
//                     'name': 'Vehicles / Aircraft / Yachts and Water Craft',
//                     'description': '',
//                     'parentItemCategoryId': 4,
//                     'updatedAt': 1545807545198,
//                     'createdAt': 1543920716336,
//                     'ParentItemCategory': {
//                         'id': 4,
//                         'key': 'cat_high_value',
//                         'name': 'High Value (10,000$+)',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545147,
//                         'createdAt': 1543920716291,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 48,
//                     'hash': '603738e0dee65deb63f03f0ee5ae1691d5adb03c6f7497c2bd56201867d523dc',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021417847,
//                     'createdAt': 1544021417847,
//                     'ItemImageDatas': [{
//                         'id': 180,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/48/ORIGINAL',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434400,
//                         'createdAt': 1544021434400,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 183,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/48/LARGE',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434637,
//                         'createdAt': 1544021434637,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 185,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/48/MEDIUM',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021434925,
//                         'createdAt': 1544021434925,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 187,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/48/THUMBNAIL',
//                         'itemImageId': 48,
//                         'updatedAt': 1544021435075,
//                         'createdAt': 1544021435075,
//                         'originalMime': null,
//                         'originalName': null
//                     }]

//                 },
//                 {
//                     'id': 49,
//                     'hash': '10db9386db9377c4227cda53e4b1abc3c49f0ea57770add1b3f9bb912d97d9e6',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021435326,
//                     'createdAt': 1544021435326,
//                     'ItemImageDatas': [{
//                         'id': 188,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/49/ORIGINAL',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450309,
//                         'createdAt': 1544021450309,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 189,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/49/LARGE',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450489,
//                         'createdAt': 1544021450489,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 190,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/49/MEDIUM',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450607,
//                         'createdAt': 1544021450607,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 191,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/49/THUMBNAIL',
//                         'itemImageId': 49,
//                         'updatedAt': 1544021450704,
//                         'createdAt': 1544021450704,
//                         'originalMime': null,
//                         'originalName': null
//                     }]

//                 },
//                 {
//                     'id': 50,
//                     'hash': '5192a3dfc9b00f0afaf83d2848df3f9b60a57c07841e317e522a72f502f63cb2',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021450864,
//                     'createdAt': 1544021450864,
//                     'ItemImageDatas': [{
//                         'id': 192,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/50/ORIGINAL',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021464512,
//                         'createdAt': 1544021464512,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 194,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/50/LARGE',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021484485,
//                         'createdAt': 1544021484485,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 196,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/50/MEDIUM',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021484805,
//                         'createdAt': 1544021484805,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 198,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/50/THUMBNAIL',
//                         'itemImageId': 50,
//                         'updatedAt': 1544021485147,
//                         'createdAt': 1544021485147,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 55,
//                     'region': 'IT',
//                     'address': 'a',
//                     'itemInformationId': 56,
//                     'updatedAt': 1544021417801,
//                     'createdAt': 1544021417801,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 53,
//                 'type': 'SALE',
//                 'listingItemId': 54,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1544021485341,
//                 'createdAt': 1544021485341,
//                 'Escrow': {
//                     'id': 53,
//                     'type': 'MAD',
//                     'paymentInformationId': 53,
//                     'updatedAt': 1544021485352,
//                     'createdAt': 1544021485352,
//                     'Ratio': {
//                         'id': 53,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 53,
//                         'updatedAt': 1544021485357,
//                         'createdAt': 1544021485357
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 53,
//                     'currency': 'PARTICL',
//                     'basePrice': 1,
//                     'paymentInformationId': 53,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1544021485365,
//                     'createdAt': 1544021485365,
//                     'ShippingPrice': {
//                         'id': 53,
//                         'domestic': 0.1,
//                         'international': 0.2,
//                         'itemPriceId': 53,
//                         'updatedAt': 1544021485370,
//                         'createdAt': 1544021485370
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 51,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 54,
//                 'updatedAt': 1544021485413,
//                 'createdAt': 1544021485413,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 51,
//                     'actionMessageId': 51,
//                     'dataId': 'seller',
//                     'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                     'updatedAt': 1544021485435,
//                     'createdAt': 1544021485435
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 51,
//                     'actionMessageId': 51,
//                     'msgid': '000000005c06af05cb210c93b47f40ab998d6dc593b28b15e9d9d36d',
//                     'version': '0300',
//                     'received': '2018-12-05T14:46:28.000Z',
//                     'sent': '2018-12-04T16:44:53.000Z',
//                     'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1544021485423,
//                     'createdAt': 1544021485423
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}
//         }

//     },
//     {
//         'object': {
//             'id': 17,
//             'hash': '3826f72c3d67f45f5e944937541b4babbf87be309f172f9587fe81d4f95aea95',
//             'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1543924039000,
//             'postedAt': 1543856654000,
//             'expiredAt': 1546275854000,
//             'updatedAt': 1543924268595,
//             'createdAt': 1543924268595,
//             'ItemInformation': {
//                 'id': 18,
//                 'title': 'BIORE hand cream 1 piece',
//                 'shortDescription': 'BIORE hand cream',
//                 'longDescription': 'BIORE hand cream - the best of the best form the best of the best. Super great awesome creamy cream. \n\nSeller: Hopium ',
//                 'itemCategoryId': 53,
//                 'listingItemId': 17,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1543924269629,
//                 'createdAt': 1543924269629,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 53,
//                     'key': 'cat_health_personal_care',
//                     'name': 'Health and Personal Care',
//                     'description': '',
//                     'parentItemCategoryId': 51,
//                     'updatedAt': 1545807545991,
//                     'createdAt': 1543920717255,
//                     'ParentItemCategory': {
//                         'id': 51,
//                         'key': 'cat_health_beauty_personal',
//                         'name': 'Health / Beauty and Personal Care',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545948,
//                         'createdAt': 1543920717225,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 19,
//                     'hash': 'fd3c0d16085792fd86a05e55fed1705d68dfce8e316e3063fa6db14a54569b11',
//                     'itemInformationId': 18,
//                     'updatedAt': 1543924270677,
//                     'createdAt': 1543924270677,
//                     'ItemImageDatas': [{
//                         'id': 73,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/19/ORIGINAL',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924279832,
//                         'createdAt': 1543924279832,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 74,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/19/LARGE',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924279971,
//                         'createdAt': 1543924279971,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 76,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/19/MEDIUM',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924290608,
//                         'createdAt': 1543924290608,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 77,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/19/THUMBNAIL',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924290668,
//                         'createdAt': 1543924290668,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 18,
//                     'region': 'NL',
//                     'address': 'a',
//                     'itemInformationId': 18,
//                     'updatedAt': 1543924270639,
//                     'createdAt': 1543924270639,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 18,
//                 'type': 'SALE',
//                 'listingItemId': 17,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1543924290766,
//                 'createdAt': 1543924290766,
//                 'Escrow': {
//                     'id': 18,
//                     'type': 'MAD',
//                     'paymentInformationId': 18,
//                     'updatedAt': 1543924290776,
//                     'createdAt': 1543924290776,
//                     'Ratio': {
//                         'id': 18,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 18,
//                         'updatedAt': 1543924290785,
//                         'createdAt': 1543924290785
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 18,
//                     'currency': 'PARTICL',
//                     'basePrice': 10,
//                     'paymentInformationId': 18,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1543924290797,
//                     'createdAt': 1543924290797,
//                     'ShippingPrice': {
//                         'id': 18,
//                         'domestic': 1,
//                         'international': 2,
//                         'itemPriceId': 18,
//                         'updatedAt': 1543924290805,
//                         'createdAt': 1543924290805
//                     }
//                 }
//             },
//             'MessagingInformation': [],
//             'ListingItemObjects': [],
//             'ActionMessages': [{
//                 'id': 17,
//                 'action': 'MP_ITEM_ADD',
//                 'nonce': null,
//                 'accepted': null,
//                 'listingItemId': 17,
//                 'updatedAt': 1543924290847,
//                 'createdAt': 1543924290847,
//                 'MessageInfo': {},
//                 'MessageObjects': [{
//                     'id': 17,
//                     'actionMessageId': 17,
//                     'dataId': 'seller',
//                     'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                     'updatedAt': 1543924290861,
//                     'createdAt': 1543924290861
//                 }],
//                 'MessageEscrow': {},
//                 'MessageData': {
//                     'id': 17,
//                     'actionMessageId': 17,
//                     'msgid': '000000005c05620ee14d5ef1fbeec92f8e3f5b8239ae32fd73e374e6',
//                     'version': '0300',
//                     'received': '2018-12-04T11:47:19.000Z',
//                     'sent': '2018-12-03T17:04:14.000Z',
//                     'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                     'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                     'updatedAt': 1543924290855,
//                     'createdAt': 1543924290855
//                 }
//             }],
//             'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': {}

//         },
//         'category': {
//             'category': {
//                 'id': 53,
//                 'key': 'cat_health_personal_care',
//                 'name': 'Health and Personal Care',
//                 'description': '',
//                 'parentItemCategoryId': 51,
//                 'updatedAt': 1545807545991,
//                 'createdAt': 1543920717255,
//                 'ParentItemCategory': {
//                     'id': 51,
//                     'key': 'cat_health_beauty_personal',
//                     'name': 'Health / Beauty and Personal Care',
//                     'description': '',
//                     'parentItemCategoryId': 1,
//                     'updatedAt': 1545807545948,
//                     'createdAt': 1543920717225,
//                     'ParentItemCategory': {
//                         'id': 1,
//                         'key': 'cat_ROOT',
//                         'name': 'ROOT',
//                         'description': 'root item category',
//                         'parentItemCategoryId': null,
//                         'updatedAt': 1545807545055,
//                         'createdAt': 1543920716188
//                     }
//                 }
//             }
//         },
//         'createdAt': '04-12-2018',
//         'status': 'unpublished',
//         'basePrice': {
//             'amount': 10,
//             'maxRoundingDigits': 8
//         },
//         'domesticShippingPrice': {
//             'amount': 1,
//             'maxRoundingDigits': 8
//         },
//         'internationalShippingPrice': {
//             'amount': 2,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceInternational': {
//             'amount': 12,
//             'maxRoundingDigits': 8
//         },
//         'escrowPriceDomestic': {
//             'amount': 11,
//             'maxRoundingDigits': 8
//         },
//         'domesticTotal': {
//             'amount': 11,
//             'maxRoundingDigits': 8
//         },
//         'internationalTotal': {
//             'amount': 12,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountInternaltional': {
//             'amount': 24,
//             'maxRoundingDigits': 8
//         },
//         'totalAmountDomestic': {
//             'amount': 22,
//             'maxRoundingDigits': 8
//         },
//         'memo': '',
//         'expireTime': 4,
//         'isFlagged': false,
//         'proposalHash': '',
//         'submitterAddress': '',
//         'imageCollection': {
//             'images': [{
//                 'image': {
//                     'id': 19,
//                     'hash': 'fd3c0d16085792fd86a05e55fed1705d68dfce8e316e3063fa6db14a54569b11',
//                     'itemInformationId': 18,
//                     'updatedAt': 1543924270677,
//                     'createdAt': 1543924270677,
//                     'ItemImageDatas': [{
//                         'id': 73,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/19/ORIGINAL',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924279832,
//                         'createdAt': 1543924279832,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 74,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/19/LARGE',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924279971,
//                         'createdAt': 1543924279971,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 76,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/19/MEDIUM',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924290608,
//                         'createdAt': 1543924290608,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 77,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/19/THUMBNAIL',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924290668,
//                         'createdAt': 1543924290668, 'originalMime': null, 'originalName': null
//                     }]
//                 }
//             }],
//             'default': {
//                 'image': {
//                     'ItemImageDatas': []
//                 }
//             },
//             'imageItems': [
//                 {
//                     'data': {
//                         'src': 'http://localhost:3000/api/item-images/19/MEDIUM',
//                         'thumb': 'http://localhost:3000/api/item-images/19/THUMBNAIL'
//                     }
//                 }
//             ],
//             'preview': {
//                 'image': {
//                     'id': 19,
//                     'hash': 'fd3c0d16085792fd86a05e55fed1705d68dfce8e316e3063fa6db14a54569b11',
//                     'itemInformationId': 18,
//                     'updatedAt': 1543924270677,
//                     'createdAt': 1543924270677,
//                     'ItemImageDatas': [{
//                         'id': 73,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/19/ORIGINAL',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924279832,
//                         'createdAt': 1543924279832,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 74,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/19/LARGE',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924279971,
//                         'createdAt': 1543924279971,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 76,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/19/MEDIUM',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924290608,
//                         'createdAt': 1543924290608,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 77,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/19/THUMBNAIL',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924290668,
//                         'createdAt': 1543924290668,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }
//             }

//         },
//         'listing': {
//             'id': 17,
//             'hash': '3826f72c3d67f45f5e944937541b4babbf87be309f172f9587fe81d4f95aea95',
//             'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'marketId': 1,
//             'listingItemTemplateId': null,
//             'expiryTime': 28,
//             'receivedAt': 1543924039000,
//             'postedAt': 1543856654000,
//             'expiredAt': 1546275854000,
//             'updatedAt': 1543924268595,
//             'createdAt': 1543924268595,
//             'ItemInformation': {
//                 'id': 18,
//                 'title': 'BIORE hand cream 1 piece',
//                 'shortDescription': 'BIORE hand cream',
//                 'longDescription': 'BIORE hand cream - the best of the best form the best of the best. Super great awesome creamy cream. \n\nSeller: Hopium ',
//                 'itemCategoryId': 53,
//                 'listingItemId': 17,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1543924269629,
//                 'createdAt': 1543924269629,
//                 'ShippingDestinations': [],
//                 'ItemCategory': {
//                     'id': 53,
//                     'key': 'cat_health_personal_care',
//                     'name': 'Health and Personal Care',
//                     'description': '',
//                     'parentItemCategoryId': 51,
//                     'updatedAt': 1545807545991,
//                     'createdAt': 1543920717255,
//                     'ParentItemCategory': {
//                         'id': 51,
//                         'key': 'cat_health_beauty_personal',
//                         'name': 'Health / Beauty and Personal Care',
//                         'description': '',
//                         'parentItemCategoryId': 1,
//                         'updatedAt': 1545807545948,
//                         'createdAt': 1543920717225,
//                         'ParentItemCategory': {
//                             'id': 1,
//                             'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                             'description': 'root item category',
//                             'parentItemCategoryId': null,
//                             'updatedAt': 1545807545055,
//                             'createdAt': 1543920716188
//                         }
//                     }
//                 },
//                 'ItemImages': [{
//                     'id': 19,
//                     'hash': 'fd3c0d16085792fd86a05e55fed1705d68dfce8e316e3063fa6db14a54569b11',
//                     'itemInformationId': 18,
//                     'updatedAt': 1543924270677,
//                     'createdAt': 1543924270677,
//                     'ItemImageDatas': [{
//                         'id': 73,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'ORIGINAL',
//                         'dataId': 'http://localhost:3000/api/item-images/19/ORIGINAL',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924279832,
//                         'createdAt': 1543924279832,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 74,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'LARGE',
//                         'dataId': 'http://localhost:3000/api/item-images/19/LARGE',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924279971,
//                         'createdAt': 1543924279971,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 76,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'MEDIUM',
//                         'dataId': 'http://localhost:3000/api/item-images/19/MEDIUM',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924290608,
//                         'createdAt': 1543924290608,
//                         'originalMime': null,
//                         'originalName': null
//                     },
//                     {
//                         'id': 77,
//                         'protocol': 'LOCAL',
//                         'encoding': 'BASE64',
//                         'imageVersion': 'THUMBNAIL',
//                         'dataId': 'http://localhost:3000/api/item-images/19/THUMBNAIL',
//                         'itemImageId': 19,
//                         'updatedAt': 1543924290668,
//                         'createdAt': 1543924290668,
//                         'originalMime': null,
//                         'originalName': null
//                     }]
//                 }],
//                 'ItemLocation': {
//                     'id': 18,
//                     'region': 'NL',
//                     'address': 'a',
//                     'itemInformationId': 18,
//                     'updatedAt': 1543924270639,
//                     'createdAt': 1543924270639,
//                     'LocationMarker': {}
//                 }

//             },
//             'PaymentInformation': {
//                 'id': 18,
//                 'type': 'SALE',
//                 'listingItemId': 17,
//                 'listingItemTemplateId': null,
//                 'updatedAt': 1543924290766,
//                 'createdAt': 1543924290766,
//                 'Escrow': {
//                     'id': 18,
//                     'type': 'MAD',
//                     'paymentInformationId': 18,
//                     'updatedAt': 1543924290776,
//                     'createdAt': 1543924290776,
//                     'Ratio': {
//                         'id': 18,
//                         'buyer': 100,
//                         'seller': 100,
//                         'escrowId': 18,
//                         'updatedAt': 1543924290785,
//                         'createdAt': 1543924290785
//                     }
//                 },
//                 'ItemPrice': {
//                     'id': 18,
//                     'currency': 'PARTICL',
//                     'basePrice': 10,
//                     'paymentInformationId': 18,
//                     'cryptocurrencyAddressId': null,
//                     'updatedAt': 1543924290797,
//                     'createdAt': 1543924290797,
//                     'ShippingPrice':
//                         'id': 18,
//                         'domestic': 1,
//                         'international': 2,
//                         'itemPriceId': 18,
//                         'updatedAt': 1543924290805,
//                         'createdAt': 1543924290805
//                 }
//             }
//         },
//         'MessagingInformation': [],
//         'ListingItemObjects': [],
//         'ActionMessages': [{
//             'id': 17,
//             'action': 'MP_ITEM_ADD',
//             'nonce': null,
//             'accepted': null,
//             'listingItemId': 17,
//             'updatedAt': 1543924290847,
//             'createdAt': 1543924290847,
//             'MessageInfo': {},
//             'MessageObjects': [{
//                 'id': 17,
//                 'actionMessageId': 17,
//                 'dataId': 'seller',
//                 'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                 'updatedAt': 1543924290861,
//                 'createdAt': 1543924290861
//             }],
//             'MessageEscrow': {},
//             'MessageData': {
//                 'id': 17,
//                 'actionMessageId': 17,
//                 'msgid': '000000005c05620ee14d5ef1fbeec92f8e3f5b8239ae32fd73e374e6',
//                 'version': '0300',
//                 'received': '2018-12-04T11:47:19.000Z',
//                 'sent': '2018-12-03T17:04:14.000Z',
//                 'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                 'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1543924290855,
//                 'createdAt': 1543924290855
//             }
//         }],
//         'Bids': [],
//         'Market': {
//             'id': 1,
//             'name': 'DEFAULT',
//             'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//             'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//             'updatedAt': 1545807544987,
//             'createdAt': 1543920716143
//         },
//         'FlaggedItem': {}
//     }

//     },
// {
//     'object': {
//         'id': 12,
//         'hash': '64a06df57569ab1e7bb1f2e0b3f6a674df207350e05a4ca7e8e508e41798f920',
//         'seller': 'pYJfEhyEgFLHnxoxsnygd25WMcBkL6t6ZR',
//         'marketId': 1,
//         'listingItemTemplateId': null,
//         'expiryTime': 28,
//         'receivedAt': 1543924039000,
//         'postedAt': 1543501205000,
//         'expiredAt': 1545920405000,
//         'updatedAt': 1543924211503,
//         'createdAt': 1543924211503,
//         'ItemInformation': {
//             'id': 13,
//             'title': 't-shirt test',
//             'shortDescription': 'jflsdjflkødjfklj',
//             'longDescription': 'jklsjdkflaødjfklø',
//             'itemCategoryId': 5,
//             'listingItemId': 12,
//             'listingItemTemplateId': null,
//             'updatedAt': 1543924211550,
//             'createdAt': 1543924211550,
//             'ShippingDestinations': [],
//             'ItemCategory':
//             'id': 5,
//             'key': 'cat_high_business_corporate',
//             'name': 'Business / Corporate',
//             'description': '',
//             'parentItemCategoryId': 4,
//             'updatedAt': 1545807545174,
//             'createdAt': 1543920716314,
//             'ParentItemCategory': {
//                 'id': 4,
//                 'key': 'cat_high_value',
//                 'name': 'High Value (10,000$+)',
//                 'description': '',
//                 'parentItemCategoryId': 1,
//                 'updatedAt': 1545807545147,
//                 'createdAt': 1543920716291,
//                 'ParentItemCategory': {
//                     'id': 1,
//                     'key': 'cat_ROOT',
//                     'name': 'ROOT',
//                     'description': 'root item category',
//                     'parentItemCategoryId': null,
//                     'updatedAt': 1545807545055,
//                     'createdAt': 1543920716188
//                 }
//             }
//         },
//         'ItemImages': [{
//             'id': 15,
//             'hash': 'a2220bf97e7f97856c49a0bffad7d0929ed2d8138a579be22ef1262b61a32952',
//             'itemInformationId': 13,
//             'updatedAt': 1543924212651,
//             'createdAt': 1543924212651,
//             'ItemImageDatas': [{
//                 'id': 57,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/15/ORIGINAL',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232248,
//                 'createdAt': 1543924232248,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 58,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/15/LARGE',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232398,
//                 'createdAt': 1543924232398,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 59,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/15/MEDIUM',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232472,
//                 'createdAt': 1543924232472,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 60,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/15/THUMBNAIL',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232545,
//                 'createdAt': 1543924232545,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }],
//         'ItemLocation': {
//             'id': 13,
//             'region': 'BE',
//             'address': 'a',
//             'itemInformationId': 13,
//             'updatedAt': 1543924212562,
//             'createdAt': 1543924212562,
//             'LocationMarker': { }
//         }

//     },
//     'PaymentInformation': {
//         'id': 13,
//         'type': 'SALE',
//         'listingItemId': 12,
//         'listingItemTemplateId': null,
//         'updatedAt': 1543924232644,
//         'createdAt': 1543924232644,
//         'Escrow': {
//             'id': 13,
//             'type': 'MAD',
//             'paymentInformationId': 13,
//             'updatedAt': 1543924232655,
//             'createdAt': 1543924232655,
//             'Ratio': {
//                 'id': 13,
//                 'buyer': 100,
//                 'seller': 100,
//                 'escrowId': 13,
//                 'updatedAt': 1543924232665,
//                 'createdAt': 1543924232665
//             }
//         },
//         'ItemPrice': {
//             'id': 13,
//             'currency': 'PARTICL',
//             'basePrice': 0.001,
//             'paymentInformationId': 13,
//             'cryptocurrencyAddressId': null,
//             'updatedAt': 1543924232676,
//             'createdAt': 1543924232676,
//             'ShippingPrice':
//             'id': 13,
//             'domestic': 0.00001,
//             'international': 0.0001,
//             'itemPriceId': 13,
//             'updatedAt': 1543924232685,
//             'createdAt': 1543924232685
//         }
//     }
// },
// 'MessagingInformation': [],
// 'ListingItemObjects': [],
// 'ActionMessages': [{
//     'id': 12,
//     'action': 'MP_ITEM_ADD',
//     'nonce': null,
//     'accepted': null,
//     'listingItemId': 12,
//     'updatedAt': 1543924232724,
//     'createdAt': 1543924232724,
//     'MessageInfo': {},
//     'MessageObjects': [{
//         'id': 12,
//         'actionMessageId': 12,
//         'dataId': 'seller',
//         'dataValue': 'pYJfEhyEgFLHnxoxsnygd25WMcBkL6t6ZR',
//         'updatedAt': 1543924232743,
//         'createdAt': 1543924232743
//     }],
//     'MessageEscrow': {},
//     'MessageData': {
//         'id': 12,
//         'actionMessageId': 12,
//         'msgid': '000000005bfff5955324d74926ff3ce53316dd319fc2eac1c7c2d205',
//         'version': '0300',
//         'received': '2018-12-04T11:47:19.000Z',
//         'sent': '2018-11-29T14:20:05.000Z',
//         'from': 'pYJfEhyEgFLHnxoxsnygd25WMcBkL6t6ZR',
//         'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//         'updatedAt': 1543924232733,
//         'createdAt': 1543924232733
//     }
// }],
// 'Bids': [],
// 'Market': {
//     'id': 1,
//     'name': 'DEFAULT',
//     'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//     'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//     'updatedAt': 1545807544987,
//     'createdAt': 1543920716143
// },
// 'FlaggedItem': { }

//         },
//         'category': {
//     'category': {
//         'id': 5,
//         'key': 'cat_high_business_corporate',
//         'name': 'Business / Corporate',
//         'description': '',
//         'parentItemCategoryId': 4,
//         'updatedAt': 1545807545174,
//         'createdAt': 1543920716314,
//         'ParentItemCategory': {
//             'id': 4,
//             'key': 'cat_high_value',
//             'name': 'High Value (10,000$+)',
//             'description': '',
//             'parentItemCategoryId': 1,
//             'updatedAt': 1545807545147,
//             'createdAt': 1543920716291,
//             'ParentItemCategory':
//             'id': 1,
//             'key': 'cat_ROOT',
//             'name': 'ROOT',
//             'description': 'root item category',
//             'parentItemCategoryId': null,
//             'updatedAt': 1545807545055,
//             'createdAt': 1543920716188
//         }
//     }
// }
//      },
//      'createdAt': '04-12-2018',
//      'status': 'unpublished',
//      'basePrice': {
//     'amount': 0.001,
//     'maxRoundingDigits': 8
// },
// 'domesticShippingPrice': {
//     'amount': 0.00001,
//     'maxRoundingDigits': 8
// },
// 'internationalShippingPrice': {
//     'amount': 0.0001,
//     'maxRoundingDigits':
//     8
// },
// 'escrowPriceInternational': {
//     'amount': 0.0011,
//     'maxRoundingDigits': 8
// },
// 'escrowPriceDomestic': {
//     'amount': 0.00101,
//     'maxRoundingDigits': 8
// },
// 'domesticTotal': {
//     'amount': 0.00101,
//     'maxRoundingDigits': 8
// },
// 'internationalTotal': {
//     'amount': 0.0011,
//     'maxRoundingDigits': 8
// },
// 'totalAmountInternaltional': {
//     'amount': 0.0022,
//     'maxRoundingDigits': 8
// },
// 'totalAmountDomestic': {
//     'amount': 0.00202,
//     'maxRoundingDigits': 8
// },
// 'memo': '',
// 'expireTime': 4,
// 'isFlagged': false,
// 'proposalHash': '',
// 'submitterAddress': '',
// 'imageCollection': {
//     'images': [{
//         'image': {
//             'id': 15,
//             'hash': 'a2220bf97e7f97856c49a0bffad7d0929ed2d8138a579be22ef1262b61a32952',
//             'itemInformationId': 13,
//             'updatedAt': 1543924212651,
//             'createdAt': 1543924212651,
//             'ItemImageDatas': [{
//                 'id': 57,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/15/ORIGINAL',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232248,
//                 'createdAt': 1543924232248,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 58,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/15/LARGE',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232398,
//                 'createdAt': 1543924232398,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 59,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/15/MEDIUM',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232472,
//                 'createdAt': 1543924232472,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 60,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/15/THUMBNAIL',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232545,
//                 'createdAt': 1543924232545,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }
//     }],
//     'default': {
//         'image': { 'ItemImageDatas': [] }
//     },
//     'imageItems': [{ 'data': { 'src': 'http://localhost:3000/api/item-images/15/MEDIUM',
//     'thumb': 'http://localhost:3000/api/item-images/15/THUMBNAIL' } }],
//     'preview': {
//         'image': {
//             'id': 15,
//             'hash': 'a2220bf97e7f97856c49a0bffad7d0929ed2d8138a579be22ef1262b61a32952',
//             'itemInformationId': 13,
//             'updatedAt': 1543924212651,
//             'createdAt': 1543924212651,
//             'ItemImageDatas': [{
//                 'id': 57,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/15/ORIGINAL',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232248,
//                 'createdAt': 1543924232248,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 58,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/15/LARGE',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232398,
//                 'createdAt': 1543924232398,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 59,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/15/MEDIUM',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232472,
//                 'createdAt': 1543924232472,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 60,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/15/THUMBNAIL',
//                 'itemImageId': 15,
//                 'updatedAt': 1543924232545,
//                 'createdAt': 1543924232545,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }
//     }

// },
// 'listing': {
//     'id': 12,
//     'hash': '64a06df57569ab1e7bb1f2e0b3f6a674df207350e05a4ca7e8e508e41798f920',
//     'seller': 'pYJfEhyEgFLHnxoxsnygd25WMcBkL6t6ZR',
//     'marketId': 1,
//     'listingItemTemplateId': null,
//     'expiryTime': 28,
//     'receivedAt': 1543924039000,
//     'postedAt': 1543501205000,
//     'expiredAt': 1545920405000,
//     'updatedAt': 1543924211503,
//     'createdAt': 1543924211503,
//     'ItemInformation': {
//         'id': 13,
//         'title': 't-shirt test',
//         'shortDescription': 'jflsdjflkødjfklj',
//         'longDescription': 'jklsjdkflaødjfklø',
//         'itemCategoryId': 5,
//         'listingItemId': 12,
//         'listingItemTemplateId': null,
//         'updatedAt': 1543924211550,
//         'createdAt': 1543924211550,
//         'ShippingDestinations': [],
//         'ItemCategory':
//         'id': 5,
//         'key': 'cat_high_business_corporate',
//         'name': 'Business / Corporate',
//         'description': '',
//         'parentItemCategoryId': 4,
//         'updatedAt': 1545807545174,
//         'createdAt': 1543920716314,
//         'ParentItemCategory': {
//             'id': 4,
//             'key': 'cat_high_value',
//             'name': 'High Value (10,000$+)',
//             'description': '',
//             'parentItemCategoryId': 1,
//             'updatedAt': 1545807545147,
//             'createdAt': 1543920716291,
//             'ParentItemCategory': {
//                 'id': 1,
//                 'key': 'cat_ROOT',
//                 'name': 'ROOT',
//                 'description': 'root item category',
//                 'parentItemCategoryId': null,
//                 'updatedAt': 1545807545055,
//                 'createdAt': 1543920716188
//             }
//         }
//     },
//     'ItemImages': [{
//         'id': 15,
//         'hash': 'a2220bf97e7f97856c49a0bffad7d0929ed2d8138a579be22ef1262b61a32952',
//         'itemInformationId': 13,
//         'updatedAt': 1543924212651,
//         'createdAt': 1543924212651,
//         'ItemImageDatas': [{
//             'id': 57,
//             'protocol': 'LOCAL',
//             'encoding': 'BASE64',
//             'imageVersion': 'ORIGINAL',
//             'dataId': 'http://localhost:3000/api/item-images/15/ORIGINAL',
//             'itemImageId': 15,
//             'updatedAt': 1543924232248,
//             'createdAt': 1543924232248,
//             'originalMime': null,
//             'originalName': null
//         },
//         {
//             'id': 58,
//             'protocol': 'LOCAL',
//             'encoding': 'BASE64',
//             'imageVersion': 'LARGE',
//             'dataId': 'http://localhost:3000/api/item-images/15/LARGE',
//             'itemImageId': 15,
//             'updatedAt': 1543924232398,
//             'createdAt': 1543924232398,
//             'originalMime': null,
//             'originalName': null
//         },
//         {
//             'id': 59,
//             'protocol': 'LOCAL',
//             'encoding': 'BASE64',
//             'imageVersion': 'MEDIUM',
//             'dataId': 'http://localhost:3000/api/item-images/15/MEDIUM',
//             'itemImageId': 15,
//             'updatedAt': 1543924232472,
//             'createdAt': 1543924232472,
//             'originalMime': null,
//             'originalName': null
//         },
//         {
//             'id': 60,
//             'protocol': 'LOCAL',
//             'encoding': 'BASE64',
//             'imageVersion': 'THUMBNAIL',
//             'dataId': 'http://localhost:3000/api/item-images/15/THUMBNAIL',
//             'itemImageId': 15,
//             'updatedAt': 1543924232545,
//             'createdAt': 1543924232545,
//             'originalMime': null,
//             'originalName': null
//         }]
//     }],
//     'ItemLocation': {
//         'id': 13,
//         'region': 'BE',
//         'address': 'a',
//         'itemInformationId': 13,
//         'updatedAt': 1543924212562,
//         'createdAt': 1543924212562,
//         'LocationMarker': { }
//     }

// },
// 'PaymentInformation': {
//     'id': 13,
//     'type': 'SALE',
//     'listingItemId': 12,
//     'listingItemTemplateId': null,
//     'updatedAt': 1543924232644,
//     'createdAt': 1543924232644,
//     'Escrow': {
//         'id': 13,
//         'type': 'MAD',
//         'paymentInformationId': 13,
//         'updatedAt': 1543924232655,
//         'createdAt': 1543924232655,
//         'Ratio': {
//             'id': 13,
//             'buyer': 100,
//             'seller': 100,
//             'escrowId': 13,
//             'updatedAt': 1543924232665,
//             'createdAt': 1543924232665
//         }
//     },
//     'ItemPrice': {
//         'id': 13,
//         'currency': 'PARTICL',
//         'basePrice': 0.001,
//         'paymentInformationId': 13,
//         'cryptocurrencyAddressId': null,
//         'updatedAt': 1543924232676,
//         'createdAt': 1543924232676,
//         'ShippingPrice':
//         'id': 13,
//         'domestic': 0.00001,
//         'international': 0.0001,
//         'itemPriceId': 13,
//         'updatedAt': 1543924232685,
//         'createdAt': 1543924232685
//     }
// }
//          },
//          'MessagingInformation': [],
//          'ListingItemObjects': [],
//          'ActionMessages': [{
//     'id': 12,
//     'action': 'MP_ITEM_ADD',
//     'nonce': null,
//     'accepted': null,
//     'listingItemId': 12,
//     'updatedAt': 1543924232724,
//     'createdAt': 1543924232724,
//     'MessageInfo': {},
//     'MessageObjects': [{
//         'id': 12,
//         'actionMessageId': 12,
//         'dataId': 'seller',
//         'dataValue': 'pYJfEhyEgFLHnxoxsnygd25WMcBkL6t6ZR',
//         'updatedAt': 1543924232743,
//         'createdAt': 1543924232743
//     }],
//     'MessageEscrow': {},
//     'MessageData': {
//         'id': 12,
//         'actionMessageId': 12,
//         'msgid': '000000005bfff5955324d74926ff3ce53316dd319fc2eac1c7c2d205',
//         'version': '0300',
//         'received': '2018-12-04T11:47:19.000Z',
//         'sent': '2018-11-29T14:20:05.000Z',
//         'from': 'pYJfEhyEgFLHnxoxsnygd25WMcBkL6t6ZR',
//         'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//         'updatedAt': 1543924232733,
//         'createdAt': 1543924232733
//     }
// }],
// 'Bids': [],
// 'Market': {
//     'id': 1,
//     'name': 'DEFAULT',
//     'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//     'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//     'updatedAt': 1545807544987,
//     'createdAt': 1543920716143
// },
// 'FlaggedItem': { }
//         }

//     },
// {
//     'object': {
//         'id': 6,
//         'hash': '55764bca8f5491b89e7335b21c93a3f3b3cedb797397f571b8cb13ec4d579ac7',
//         'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//         'marketId': 1,
//         'listingItemTemplateId': null,
//         'expiryTime': 28,
//         'receivedAt': 1543924040000,
//         'postedAt': 1543911069000,
//         'expiredAt': 1546330269000,
//         'updatedAt': 1543924122944,
//         'createdAt': 1543924122944,
//         'ItemInformation': {
//             'id': 7,
//             'title': 'Fructis shampoo 1 piece',
//             'shortDescription': 'Hair shampoo.',
//             'longDescription': 'Great shampoo for great people. Order 1 piece.',
//             'itemCategoryId': 53,
//             'listingItemId': 6,
//             'listingItemTemplateId': null,
//             'updatedAt': 1543924122975,
//             'createdAt': 1543924122975,
//             'ShippingDestinations': [],
//             'ItemCategory': {
//                 'id': 53,
//                 'key': 'cat_health_personal_care',
//                 'name': 'Health and Personal Care',
//                 'description': '',
//                 'parentItemCategoryId': 51,
//                 'updatedAt': 1545807545991,
//                 'createdAt': 1543920717255,
//                 'ParentItemCategory': {
//                     'id': 51,
//                     'key': 'cat_health_beauty_personal',
//                     'name': 'Health / Beauty and Personal Care',
//                     'description': '',
//                     'parentItemCategoryId': 1,
//                     'updatedAt': 1545807545948,
//                     'createdAt': 1543920717225,
//                     'ParentItemCategory': {
//                         'id': 1,
//                         'key': 'cat_ROOT',
//                         'name': 'ROOT',
//                         'description': 'root item category',
//                         'parentItemCategoryId': null,
//                         'updatedAt': 1545807545055,
//                         'createdAt': 1543920716188
//                     }
//                 }
//             },
//             'ItemImages': [{
//                 'id': 9,
//                 'hash': '53285e01155af28e60cc5fe93e95925010843fb7894339a95e97f85230ce32a8',
//                 'itemInformationId': 7,
//                 'updatedAt': 1543924123025,
//                 'createdAt': 1543924123025,
//                 'ItemImageDatas': [{
//                     'id': 30,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'ORIGINAL',
//                     'dataId': 'http://localhost:3000/api/item-images/9/ORIGINAL',
//                     'itemImageId': 9,
//                     'updatedAt': 1543924143854,
//                     'createdAt': 1543924143854,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 32,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'LARGE',
//                     'dataId': 'http://localhost:3000/api/item-images/9/LARGE',
//                     'itemImageId': 9,
//                     'updatedAt': 1543924143939,
//                     'createdAt': 1543924143939,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 35,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'MEDIUM',
//                     'dataId': 'http://localhost:3000/api/item-images/9/MEDIUM',
//                     'itemImageId': 9,
//                     'updatedAt': 1543924144059,
//                     'createdAt': 1543924144059,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 36,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'THUMBNAIL',
//                     'dataId': 'http://localhost:3000/api/item-images/9/THUMBNAIL',
//                     'itemImageId': 9,
//                     'updatedAt': 1543924145099,
//                     'createdAt': 1543924145099,
//                     'originalMime': null,
//                     'originalName': null
//                 }]
//             }],
//             'ItemLocation': {
//                 'id': 7,
//                 'region': 'DE',
//                 'address': 'a',
//                 'itemInformationId': 7,
//                 'updatedAt': 1543924122987,
//                 'createdAt': 1543924122987,
//                 'LocationMarker': { }
//             }

//         },
//         'PaymentInformation': {
//             'id': 8,
//             'type': 'SALE',
//             'listingItemId': 6,
//             'listingItemTemplateId': null,
//             'updatedAt': 1543924145162,
//             'createdAt': 1543924145162,
//             'Escrow': {
//                 'id': 8,
//                 'type': 'MAD',
//                 'paymentInformationId': 8,
//                 'updatedAt': 1543924145174,
//                 'createdAt': 1543924145174,
//                 'Ratio': {
//                     'id': 8,
//                     'buyer': 100,
//                     'seller': 100,
//                     'escrowId': 8,
//                     'updatedAt': 1543924145180,
//                     'createdAt': 1543924145180
//                 }
//             },
//             'ItemPrice': {
//                 'id': 8,
//                 'currency': 'PARTICL',
//                 'basePrice': 1,
//                 'paymentInformationId': 8,
//                 'cryptocurrencyAddressId': null,
//                 'updatedAt': 1543924145187,
//                 'createdAt': 1543924145187,
//                 'ShippingPrice':
//                 'id': 8,
//                 'domestic': 0.1,
//                 'international': 0.2,
//                 'itemPriceId': 8,
//                 'updatedAt': 1543924145196,
//                 'createdAt': 1543924145196
//             }
//         }
//     },
//     'MessagingInformation': [],
//     'ListingItemObjects': [],
//     'ActionMessages': [{
//         'id': 7,
//         'action': 'MP_ITEM_ADD',
//         'nonce': null,
//         'accepted': null,
//         'listingItemId': 6,
//         'updatedAt': 1543924145241,
//         'createdAt': 1543924145241,
//         'MessageInfo': {},
//         'MessageObjects': [{
//             'id': 6,
//             'actionMessageId': 7,
//             'dataId': 'seller',
//             'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'updatedAt': 1543924145259,
//             'createdAt': 1543924145259
//         }],
//         'MessageEscrow': {},
//         'MessageData': {
//             'id': 7,
//             'actionMessageId': 7,
//             'msgid': '000000005c06369d133e0180701bdad5e51b31879dfd76067c6bcfb3',
//             'version': '0300',
//             'received': '2018-12-04T11:47:20.000Z',
//             'sent': '2018-12-04T08:11:09.000Z',
//             'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//             'updatedAt': 1543924145250,
//             'createdAt': 1543924145250
//         }
//     }],
//     'Bids': [],
//     'Market': {
//         'id': 1,
//         'name': 'DEFAULT',
//         'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//         'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//         'updatedAt': 1545807544987,
//         'createdAt': 1543920716143
//     },
//     'FlaggedItem': { }

// },
// 'category': {
//     'category': {
//         'id': 53,
//         'key': 'cat_health_personal_care',
//         'name': 'Health and Personal Care',
//         'description': '',
//         'parentItemCategoryId': 51,
//         'updatedAt': 1545807545991,
//         'createdAt': 1543920717255,
//         'ParentItemCategory': {
//             'id': 51,
//             'key': 'cat_health_beauty_personal',
//             'name': 'Health / Beauty and Personal Care',
//             'description': '',
//             'parentItemCategoryId': 1,
//             'updatedAt': 1545807545948,
//             'createdAt': 1543920717225,
//             'ParentItemCategory': {
//                 'id': 1,
//                 'key': 'cat_ROOT',
//                 'name': 'ROOT',
//                 'description': 'root item category',
//                 'parentItemCategoryId': null,
//                 'updatedAt': 1545807545055,
//                 'createdAt': 1543920716188
//             }
//         }
//     }
// },
// 'createdAt': '04-12-2018',
// 'status': 'unpublished',
// 'basePrice': {
//     'amount': 1,
//     'maxRoundingDigits': 8
// },
// 'domesticShippingPrice': {
//     'amount': 0.1,
//     'maxRoundingDigits': 8
// },
// 'internationalShippingPrice': {
//     'amount': 0.2,
//     'maxRoundingDigits': 8
// },
// 'escrowPriceInternational': {
//     'amount': 1.2,
//     'maxRoundingDigits': 8
// },
// 'escrowPriceDomestic': {
//     'amount': 1.1,
//     'maxRoundingDigits': 8
// },
// 'domesticTotal': {
//     'amount': 1.1,
//     'maxRoundingDigits': 8
// },
// 'internationalTotal': {
//     'amount': 1.2,
//     'maxRoundingDigits': 8
// },
// 'totalAmountInternaltional': {
//     'amount': 2.4,
//     'maxRoundingDigits': 8
// },
// 'totalAmountDomestic': {
//     'amount': 2.2,
//     'maxRoundingDigits': 8
// },
// 'memo': '',
// 'expireTime': 4,
// 'isFlagged': false,
// 'proposalHash': '',
// 'submitterAddress': '',
// 'imageCollection': {
//     'images': [{
//         'image': {
//             'id': 9,
//             'hash': '53285e01155af28e60cc5fe93e95925010843fb7894339a95e97f85230ce32a8',
//             'itemInformationId': 7,
//             'updatedAt': 1543924123025,
//             'createdAt': 1543924123025,
//             'ItemImageDatas': [{
//                 'id': 30,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/9/ORIGINAL',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924143854,
//                 'createdAt': 1543924143854,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 32,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/9/LARGE',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924143939,
//                 'createdAt': 1543924143939,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 35,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/9/MEDIUM',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924144059,
//                 'createdAt': 1543924144059,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 36,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/9/THUMBNAIL',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924145099,
//                 'createdAt': 1543924145099,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }
//     }],
//     'default': {
//         'image': { 'ItemImageDatas': [] }
//     },
//     'imageItems': [{ 'data': { 'src': 'http://localhost:3000/api/item-images/9/MEDIUM',
//     'thumb': 'http://localhost:3000/api/item-images/9/THUMBNAIL' } }],
//     'preview': {
//         'image': {
//             'id': 9,
//             'hash': '53285e01155af28e60cc5fe93e95925010843fb7894339a95e97f85230ce32a8',
//             'itemInformationId': 7,
//             'updatedAt': 1543924123025,
//             'createdAt': 1543924123025,
//             'ItemImageDatas': [{
//                 'id': 30,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/9/ORIGINAL',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924143854,
//                 'createdAt': 1543924143854,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 32,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/9/LARGE',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924143939,
//                 'createdAt': 1543924143939,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 35,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/9/MEDIUM',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924144059,
//                 'createdAt': 1543924144059,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 36,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/9/THUMBNAIL',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924145099,
//                 'createdAt': 1543924145099,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }
//     }

// },
// 'listing': {
//     'id': 6,
//     'hash': '55764bca8f5491b89e7335b21c93a3f3b3cedb797397f571b8cb13ec4d579ac7',
//     'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//     'marketId': 1,
//     'listingItemTemplateId': null,
//     'expiryTime': 28,
//     'receivedAt': 1543924040000,
//     'postedAt': 1543911069000,
//     'expiredAt': 1546330269000,
//     'updatedAt': 1543924122944,
//     'createdAt': 1543924122944,
//     'ItemInformation': {
//         'id': 7,
//         'title': 'Fructis shampoo 1 piece',
//         'shortDescription': 'Hair shampoo.',
//         'longDescription': 'Great shampoo for great people. Order 1 piece.',
//         'itemCategoryId': 53,
//         'listingItemId': 6,
//         'listingItemTemplateId': null,
//         'updatedAt': 1543924122975,
//         'createdAt': 1543924122975,
//         'ShippingDestinations': [],
//         'ItemCategory': {
//             'id': 53,
//             'key': 'cat_health_personal_care',
//             'name': 'Health and Personal Care',
//             'description': '',
//             'parentItemCategoryId': 51,
//             'updatedAt': 1545807545991,
//             'createdAt': 1543920717255,
//             'ParentItemCategory': {
//                 'id': 51,
//                 'key': 'cat_health_beauty_personal',
//                 'name': 'Health / Beauty and Personal Care',
//                 'description': '',
//                 'parentItemCategoryId': 1,
//                 'updatedAt': 1545807545948,
//                 'createdAt': 1543920717225,
//                 'ParentItemCategory': {
//                     'id': 1,
//                     'key': 'cat_ROOT',
//                     'name': 'ROOT',
//                     'description': 'root item category',
//                     'parentItemCategoryId': null,
//                     'updatedAt': 1545807545055,
//                     'createdAt': 1543920716188
//                 }
//             }
//         },
//         'ItemImages': [{
//             'id': 9,
//             'hash': '53285e01155af28e60cc5fe93e95925010843fb7894339a95e97f85230ce32a8',
//             'itemInformationId': 7,
//             'updatedAt': 1543924123025,
//             'createdAt': 1543924123025,
//             'ItemImageDatas': [{
//                 'id': 30,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/9/ORIGINAL',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924143854,
//                 'createdAt': 1543924143854,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 32,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/9/LARGE',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924143939,
//                 'createdAt': 1543924143939,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 35,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/9/MEDIUM',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924144059,
//                 'createdAt': 1543924144059,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 36,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/9/THUMBNAIL',
//                 'itemImageId': 9,
//                 'updatedAt': 1543924145099,
//                 'createdAt': 1543924145099,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }],
//         'ItemLocation': {
//             'id': 7,
//             'region': 'DE',
//             'address': 'a',
//             'itemInformationId': 7,
//             'updatedAt': 1543924122987,
//             'createdAt': 1543924122987,
//             'LocationMarker': { }
//         }

//     },
//     'PaymentInformation': {
//         'id': 8,
//         'type': 'SALE',
//         'listingItemId': 6,
//         'listingItemTemplateId': null,
//         'updatedAt': 1543924145162,
//         'createdAt': 1543924145162,
//         'Escrow': {
//             'id': 8,
//             'type': 'MAD',
//             'paymentInformationId': 8,
//             'updatedAt': 1543924145174,
//             'createdAt': 1543924145174,
//             'Ratio': {
//                 'id': 8,
//                 'buyer': 100,
//                 'seller': 100,
//                 'escrowId': 8,
//                 'updatedAt': 1543924145180,
//                 'createdAt': 1543924145180
//             }
//         },
//         'ItemPrice': {
//             'id': 8,
//             'currency': 'PARTICL',
//             'basePrice': 1,
//             'paymentInformationId': 8,
//             'cryptocurrencyAddressId': null,
//             'updatedAt': 1543924145187,
//             'createdAt': 1543924145187,
//             'ShippingPrice':
//             'id': 8,
//             'domestic': 0.1,
//             'international': 0.2,
//             'itemPriceId': 8,
//             'updatedAt': 1543924145196,
//             'createdAt': 1543924145196
//         }
//     }
// },
// 'MessagingInformation': [],
// 'ListingItemObjects': [],
// 'ActionMessages': [{
//     'id': 7,
//     'action': 'MP_ITEM_ADD',
//     'nonce': null,
//     'accepted': null,
//     'listingItemId': 6,
//     'updatedAt': 1543924145241,
//     'createdAt': 1543924145241,
//     'MessageInfo': {},
//     'MessageObjects': [{
//         'id': 6,
//         'actionMessageId': 7,
//         'dataId': 'seller',
//         'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//         'updatedAt': 1543924145259,
//         'createdAt': 1543924145259
//     }],
//     'MessageEscrow': {},
//     'MessageData': {
//         'id': 7,
//         'actionMessageId': 7,
//         'msgid': '000000005c06369d133e0180701bdad5e51b31879dfd76067c6bcfb3',
//         'version': '0300',
//         'received': '2018-12-04T11:47:20.000Z',
//         'sent': '2018-12-04T08:11:09.000Z',
//         'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//         'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//         'updatedAt': 1543924145250,
//         'createdAt': 1543924145250
//     }
// }],
// 'Bids': [],
// 'Market': {
//     'id': 1,
//     'name': 'DEFAULT',
//     'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//     'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//     'updatedAt': 1545807544987,
//     'createdAt': 1543920716143
// },
// 'FlaggedItem': { }
//         }

//     },
// {
//     'object': {
//         'id': 5,
//         'hash': 'bd567fb814c085721ca812d379feff00437f40414a78d46588acaa5ba4526f3d',
//         'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//         'marketId': 1,
//         'listingItemTemplateId': null,
//         'expiryTime': 28,
//         'receivedAt': 1543924040000,
//         'postedAt': 1543906919000,
//         'expiredAt': 1546326119000,
//         'updatedAt': 1543924105342,
//         'createdAt': 1543924105342,
//         'ItemInformation': {
//             'id': 6,
//             'title': 'Luxury villa for sale',
//             'shortDescription': 'Custom built Luxury Villa for sale. 30% discount only buing on Particl Marketplace. Great opportunity.\n\n163 CHARTWELL ROAD\nOAKVILLE,
//             ONTARIO,
//             CANADA',
//             'longDescription': 'More details:\nhttps://www.luxuryrealestate.com/residential/3077351\n\n© 2008—2018 John Brian Losh,
//             Inc. Who\'s Who in Luxury Real Estate. All rights reserved.',
//             'itemCategoryId': 7,
//             'listingItemId': 5,
//             'listingItemTemplateId': null,
//             'updatedAt': 1543924105358,
//             'createdAt': 1543924105358,
//             'ShippingDestinations': [],
//             'ItemCategory': {
//                 'id': 7,
//                 'key': 'cat_high_real_estate',
//                 'name': 'Real Estate',
//                 'description': '',
//                 'parentItemCategoryId': 4,
//                 'updatedAt': 1545807545221,
//                 'createdAt': 1543920716354,
//                 'ParentItemCategory': {
//                     'id': 4,
//                     'key': 'cat_high_value',
//                     'name': 'High Value (10,000$+)',
//                     'description': '',
//                     'parentItemCategoryId': 1,
//                     'updatedAt': 1545807545147,
//                     'createdAt': 1543920716291,
//                     'ParentItemCategory': {
//                         'id': 1,
//                         'key': 'cat_ROOT',
//                         'name': 'ROOT',
//                         'description': 'root item category',
//                         'parentItemCategoryId': null,
//                         'updatedAt': 1545807545055,
//                         'createdAt': 1543920716188
//                     }
//                 }
//             },
//             'ItemImages': [{
//                 'id': 6,
//                 'hash': '69c1b059e2706f7dbda4e5110330797741fa3453d6ad437c9637700db89210a4',
//                 'itemInformationId': 6,
//                 'updatedAt': 1543924105421,
//                 'createdAt': 1543924105421,
//                 'ItemImageDatas': [{
//                     'id': 21,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'ORIGINAL',
//                     'dataId': 'http://localhost:3000/api/item-images/6/ORIGINAL',
//                     'itemImageId': 6,
//                     'updatedAt': 1543924110815,
//                     'createdAt': 1543924110815,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 22,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'LARGE',
//                     'dataId': 'http://localhost:3000/api/item-images/6/LARGE',
//                     'itemImageId': 6,
//                     'updatedAt': 1543924110891,
//                     'createdAt': 1543924110891,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 23,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'MEDIUM',
//                     'dataId': 'http://localhost:3000/api/item-images/6/MEDIUM',
//                     'itemImageId': 6,
//                     'updatedAt': 1543924110951,
//                     'createdAt': 1543924110951,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 24,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'THUMBNAIL',
//                     'dataId': 'http://localhost:3000/api/item-images/6/THUMBNAIL',
//                     'itemImageId': 6,
//                     'updatedAt': 1543924110990,
//                     'createdAt': 1543924110990,
//                     'originalMime': null,
//                     'originalName': null
//                 }]

//             },
//             {
//                 'id': 7,
//                 'hash': '1cb6fe5e22898172d9223c61a67f96bc0517834bc2436cb9159de99c82a902bf',
//                 'itemInformationId': 6,
//                 'updatedAt': 1543924111075,
//                 'createdAt': 1543924111075,
//                 'ItemImageDatas': [{
//                     'id': 25,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'ORIGINAL',
//                     'dataId': 'http://localhost:3000/api/item-images/7/ORIGINAL',
//                     'itemImageId': 7,
//                     'updatedAt': 1543924122855,
//                     'createdAt': 1543924122855,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 26,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'LARGE',
//                     'dataId': 'http://localhost:3000/api/item-images/7/LARGE',
//                     'itemImageId': 7,
//                     'updatedAt': 1543924122908,
//                     'createdAt': 1543924122908,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 27,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'MEDIUM',
//                     'dataId': 'http://localhost:3000/api/item-images/7/MEDIUM',
//                     'itemImageId': 7,
//                     'updatedAt': 1543924123006,
//                     'createdAt': 1543924123006,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 28,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'THUMBNAIL',
//                     'dataId': 'http://localhost:3000/api/item-images/7/THUMBNAIL',
//                     'itemImageId': 7,
//                     'updatedAt': 1543924123060,
//                     'createdAt': 1543924123060,
//                     'originalMime': null,
//                     'originalName': null
//                 }]

//             },
//             {
//                 'id': 8,
//                 'hash': '9bd11bf12fbbfa3836764a7141f0c26795ced30f99ca7929991d231a34e6b054',
//                 'itemInformationId': 6,
//                 'updatedAt': 1543924123128,
//                 'createdAt': 1543924123128,
//                 'ItemImageDatas': [{
//                     'id': 29,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'ORIGINAL',
//                     'dataId': 'http://localhost:3000/api/item-images/8/ORIGINAL',
//                     'itemImageId': 8,
//                     'updatedAt': 1543924134968,
//                     'createdAt': 1543924134968,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 31,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'LARGE',
//                     'dataId': 'http://localhost:3000/api/item-images/8/LARGE',
//                     'itemImageId': 8,
//                     'updatedAt': 1543924143917,
//                     'createdAt': 1543924143917,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 33,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'MEDIUM',
//                     'dataId': 'http://localhost:3000/api/item-images/8/MEDIUM',
//                     'itemImageId': 8,
//                     'updatedAt': 1543924144024,
//                     'createdAt': 1543924144024,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 34,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'THUMBNAIL',
//                     'dataId': 'http://localhost:3000/api/item-images/8/THUMBNAIL',
//                     'itemImageId': 8,
//                     'updatedAt': 1543924144079,
//                     'createdAt': 1543924144079,
//                     'originalMime': null,
//                     'originalName': null
//                 }]
//             }],
//             'ItemLocation': {
//                 'id': 6,
//                 'region': 'CA',
//                 'address': 'a',
//                 'itemInformationId': 6,
//                 'updatedAt': 1543924105367,
//                 'createdAt': 1543924105367,
//                 'LocationMarker': { }
//             }

//         },
//         'PaymentInformation': {
//             'id': 6,
//             'type': 'SALE',
//             'listingItemId': 5,
//             'listingItemTemplateId': null,
//             'updatedAt': 1543924144143,
//             'createdAt': 1543924144143,
//             'Escrow': {
//                 'id': 6,
//                 'type': 'MAD',
//                 'paymentInformationId': 6,
//                 'updatedAt': 1543924144150,
//                 'createdAt': 1543924144150,
//                 'Ratio': {
//                     'id': 6,
//                     'buyer': 100,
//                     'seller': 100,
//                     'escrowId': 6,
//                     'updatedAt': 1543924144157,
//                     'createdAt': 1543924144157
//                 }
//             },
//             'ItemPrice': {
//                 'id': 6,
//                 'currency': 'PARTICL',
//                 'basePrice': 9999.99,
//                 'paymentInformationId': 6,
//                 'cryptocurrencyAddressId': null,
//                 'updatedAt': 1543924144165,
//                 'createdAt': 1543924144165,
//                 'ShippingPrice':
//                 'id': 6,
//                 'domestic': 0,
//                 'international': 0,
//                 'itemPriceId': 6,
//                 'updatedAt': 1543924144172,
//                 'createdAt': 1543924144172
//             }
//         }
//     },
//     'MessagingInformation': [],
//     'ListingItemObjects': [],
//     'ActionMessages': [{
//         'id': 5,
//         'action': 'MP_ITEM_ADD',
//         'nonce': null,
//         'accepted': null,
//         'listingItemId': 5,
//         'updatedAt': 1543924144218,
//         'createdAt': 1543924144218,
//         'MessageInfo': {},
//         'MessageObjects': [{
//             'id': 5,
//             'actionMessageId': 5,
//             'dataId': 'seller',
//             'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'updatedAt': 1543924144238,
//             'createdAt': 1543924144238
//         }],
//         'MessageEscrow': {},
//         'MessageData': {
//             'id': 5,
//             'actionMessageId': 5,
//             'msgid': '000000005c06266790c312eb5ee2aaea97e72d606e5779ca226d3d2b',
//             'version': '0300',
//             'received': '2018-12-04T11:47:20.000Z',
//             'sent': '2018-12-04T07:01:59.000Z',
//             'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//             'updatedAt': 1543924144229,
//             'createdAt': 1543924144229
//         }
//     }],
//     'Bids': [],
//     'Market': {
//         'id': 1,
//         'name': 'DEFAULT',
//         'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//         'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//         'updatedAt': 1545807544987,
//         'createdAt': 1543920716143
//     },
//     'FlaggedItem': { }

// },
// 'category': {
//     'category': {
//         'id': 7,
//         'key': 'cat_high_real_estate',
//         'name': 'Real Estate',
//         'description': '',
//         'parentItemCategoryId': 4,
//         'updatedAt': 1545807545221,
//         'createdAt': 1543920716354,
//         'ParentItemCategory': {
//             'id': 4,
//             'key': 'cat_high_value',
//             'name': 'High Value (10,000$+)',
//             'description': '',
//             'parentItemCategoryId': 1,
//             'updatedAt': 1545807545147,
//             'createdAt': 1543920716291,
//             'ParentItemCategory':
//             'id': 1,
//             'key': 'cat_ROOT',
//             'name': 'ROOT',
//             'description': 'root item category',
//             'parentItemCategoryId': null,
//             'updatedAt': 1545807545055,
//             'createdAt': 1543920716188
//         }
//     }
// }
//      },
//      'createdAt': '04-12-2018',
//      'status': 'unpublished',
//      'basePrice': {
//     'amount': 9999.99,
//     'maxRoundingDigits': 8
// },
// 'domesticShippingPrice': {
//     'amount': 0,
//     'maxRoundingDigits': 8
// },
// 'internationalShippingPrice': {
//     'amount': 0,
//     'maxRoundingDigits': 8
// },
// 'escrowPriceInternational': {
//     'amount': 9999.99,
//     'maxRoundingDigits': 8
// },
// 'escrowPriceDomestic': {
//     'amount': 9999.99,
//     'maxRoundingDigits': 8
// },
// 'domesticTotal': {
//     'amount': 9999.99,
//     'maxRoundingDigits': 8
// },
// 'internationalTotal': {
//     'amount': 9999.99,
//     'maxRoundingDigits': 8
// },
// 'totalAmountInternaltional': {
//     'amount': 19999.98,
//     'maxRoundingDigits': 8
// },
// 'totalAmountDomestic': {
//     'amount': 19999.98,
//     'maxRoundingDigits': 8
// },
// 'memo': '',
// 'expireTime': 4,
// 'isFlagged': false,
// 'proposalHash': '',
// 'submitterAddress': '',
// 'imageCollection': {
//     'images': [{
//         'image': {
//             'id': 6,
//             'hash': '69c1b059e2706f7dbda4e5110330797741fa3453d6ad437c9637700db89210a4',
//             'itemInformationId': 6,
//             'updatedAt': 1543924105421,
//             'createdAt': 1543924105421,
//             'ItemImageDatas': [{
//                 'id': 21,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/6/ORIGINAL',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110815,
//                 'createdAt': 1543924110815,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 22,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/6/LARGE',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110891,
//                 'createdAt': 1543924110891,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 23,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/6/MEDIUM',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110951,
//                 'createdAt': 1543924110951,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 24,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/6/THUMBNAIL',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110990,
//                 'createdAt': 1543924110990,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }

//     },
//     {
//         'image': {
//             'id': 7,
//             'hash': '1cb6fe5e22898172d9223c61a67f96bc0517834bc2436cb9159de99c82a902bf',
//             'itemInformationId': 6,
//             'updatedAt': 1543924111075,
//             'createdAt': 1543924111075,
//             'ItemImageDatas': [{
//                 'id': 25,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/7/ORIGINAL',
//                 'itemImageId': 7,
//                 'updatedAt': 1543924122855,
//                 'createdAt': 1543924122855,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 26,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/7/LARGE',
//                 'itemImageId': 7,
//                 'updatedAt': 1543924122908,
//                 'createdAt': 1543924122908,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 27,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/7/MEDIUM',
//                 'itemImageId': 7,
//                 'updatedAt': 1543924123006,
//                 'createdAt': 1543924123006,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 28,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/7/THUMBNAIL',
//                 'itemImageId': 7,
//                 'updatedAt': 1543924123060,
//                 'createdAt': 1543924123060,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }

//     },
//     {
//         'image': {
//             'id': 8,
//             'hash': '9bd11bf12fbbfa3836764a7141f0c26795ced30f99ca7929991d231a34e6b054',
//             'itemInformationId': 6,
//             'updatedAt': 1543924123128,
//             'createdAt': 1543924123128,
//             'ItemImageDatas': [{
//                 'id': 29,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/8/ORIGINAL',
//                 'itemImageId': 8,
//                 'updatedAt': 1543924134968,
//                 'createdAt': 1543924134968,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 31,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/8/LARGE',
//                 'itemImageId': 8,
//                 'updatedAt': 1543924143917,
//                 'createdAt': 1543924143917,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 33,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/8/MEDIUM',
//                 'itemImageId': 8,
//                 'updatedAt': 1543924144024,
//                 'createdAt': 1543924144024,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 34,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/8/THUMBNAIL',
//                 'itemImageId': 8,
//                 'updatedAt': 1543924144079,
//                 'createdAt': 1543924144079,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }
//     }],
//     'default': {
//         'image': { 'ItemImageDatas': [] }
//     },
//     'imageItems': [{
//         'data': { 'src': 'http://localhost:3000/api/item-images/6/MEDIUM',
//         'thumb': 'http://localhost:3000/api/item-images/6/THUMBNAIL' }
//     },
//     {
//         'data': { 'src': 'http://localhost:3000/api/item-images/7/MEDIUM',
//         'thumb': 'http://localhost:3000/api/item-images/7/THUMBNAIL' }
//     },
//     { 'data': { 'src': 'http://localhost:3000/api/item-images/8/MEDIUM',
//     'thumb': 'http://localhost:3000/api/item-images/8/THUMBNAIL' } }],
//     'preview': {
//         'image': {
//             'id': 6,
//             'hash': '69c1b059e2706f7dbda4e5110330797741fa3453d6ad437c9637700db89210a4',
//             'itemInformationId': 6,
//             'updatedAt': 1543924105421,
//             'createdAt': 1543924105421,
//             'ItemImageDatas': [{
//                 'id': 21,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/6/ORIGINAL',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110815,
//                 'createdAt': 1543924110815,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 22,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/6/LARGE',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110891,
//                 'createdAt': 1543924110891,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 23,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/6/MEDIUM',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110951,
//                 'createdAt': 1543924110951,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 24,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/6/THUMBNAIL',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110990,
//                 'createdAt': 1543924110990,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }
//     }

// },
// 'listing': {
//     'id': 5,
//     'hash': 'bd567fb814c085721ca812d379feff00437f40414a78d46588acaa5ba4526f3d',
//     'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//     'marketId': 1,
//     'listingItemTemplateId': null,
//     'expiryTime': 28,
//     'receivedAt': 1543924040000,
//     'postedAt': 1543906919000,
//     'expiredAt': 1546326119000,
//     'updatedAt': 1543924105342,
//     'createdAt': 1543924105342,
//     'ItemInformation': {
//         'id': 6,
//         'title': 'Luxury villa for sale',
//         'shortDescription': 'Custom built Luxury Villa for sale. 30% discount only buing on Particl Marketplace. Great opportunity.\n\n163 CHARTWELL ROAD\nOAKVILLE,
//         ONTARIO,
//         CANADA',
//         'longDescription': 'More details:\nhttps://www.luxuryrealestate.com/residential/3077351\n\n© 2008—2018 John Brian Losh,
//         Inc. Who\'s Who in Luxury Real Estate. All rights reserved.',
//         'itemCategoryId': 7,
//         'listingItemId': 5,
//         'listingItemTemplateId': null,
//         'updatedAt': 1543924105358,
//         'createdAt': 1543924105358,
//         'ShippingDestinations': [],
//         'ItemCategory': {
//             'id': 7,
//             'key': 'cat_high_real_estate',
//             'name': 'Real Estate',
//             'description': '',
//             'parentItemCategoryId': 4,
//             'updatedAt': 1545807545221,
//             'createdAt': 1543920716354,
//             'ParentItemCategory': {
//                 'id': 4,
//                 'key': 'cat_high_value',
//                 'name': 'High Value (10,000$+)',
//                 'description': '',
//                 'parentItemCategoryId': 1,
//                 'updatedAt': 1545807545147,
//                 'createdAt': 1543920716291,
//                 'ParentItemCategory': {
//                     'id': 1,
//                     'key': 'cat_ROOT',
//                     'name': 'ROOT',
//                     'description': 'root item category',
//                     'parentItemCategoryId': null,
//                     'updatedAt': 1545807545055,
//                     'createdAt': 1543920716188
//                 }
//             }
//         },
//         'ItemImages': [{
//             'id': 6,
//             'hash': '69c1b059e2706f7dbda4e5110330797741fa3453d6ad437c9637700db89210a4',
//             'itemInformationId': 6,
//             'updatedAt': 1543924105421,
//             'createdAt': 1543924105421,
//             'ItemImageDatas': [{
//                 'id': 21,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/6/ORIGINAL',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110815,
//                 'createdAt': 1543924110815,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 22,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/6/LARGE',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110891,
//                 'createdAt': 1543924110891,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 23,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/6/MEDIUM',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110951,
//                 'createdAt': 1543924110951,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 24,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/6/THUMBNAIL',
//                 'itemImageId': 6,
//                 'updatedAt': 1543924110990,
//                 'createdAt': 1543924110990,
//                 'originalMime': null,
//                 'originalName': null
//             }]

//         },
//         {
//             'id': 7,
//             'hash': '1cb6fe5e22898172d9223c61a67f96bc0517834bc2436cb9159de99c82a902bf',
//             'itemInformationId': 6,
//             'updatedAt': 1543924111075,
//             'createdAt': 1543924111075,
//             'ItemImageDatas': [{
//                 'id': 25,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/7/ORIGINAL',
//                 'itemImageId': 7,
//                 'updatedAt': 1543924122855,
//                 'createdAt': 1543924122855,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 26,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/7/LARGE',
//                 'itemImageId': 7,
//                 'updatedAt': 1543924122908,
//                 'createdAt': 1543924122908,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 27,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/7/MEDIUM',
//                 'itemImageId': 7,
//                 'updatedAt': 1543924123006,
//                 'createdAt': 1543924123006,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 28,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/7/THUMBNAIL',
//                 'itemImageId': 7,
//                 'updatedAt': 1543924123060,
//                 'createdAt': 1543924123060,
//                 'originalMime': null,
//                 'originalName': null
//             }]

//         },
//         {
//             'id': 8,
//             'hash': '9bd11bf12fbbfa3836764a7141f0c26795ced30f99ca7929991d231a34e6b054',
//             'itemInformationId': 6,
//             'updatedAt': 1543924123128,
//             'createdAt': 1543924123128,
//             'ItemImageDatas': [{
//                 'id': 29,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'ORIGINAL',
//                 'dataId': 'http://localhost:3000/api/item-images/8/ORIGINAL',
//                 'itemImageId': 8,
//                 'updatedAt': 1543924134968,
//                 'createdAt': 1543924134968,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 31,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'LARGE',
//                 'dataId': 'http://localhost:3000/api/item-images/8/LARGE',
//                 'itemImageId': 8,
//                 'updatedAt': 1543924143917,
//                 'createdAt': 1543924143917,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 33,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'MEDIUM',
//                 'dataId': 'http://localhost:3000/api/item-images/8/MEDIUM',
//                 'itemImageId': 8,
//                 'updatedAt': 1543924144024,
//                 'createdAt': 1543924144024,
//                 'originalMime': null,
//                 'originalName': null
//             },
//             {
//                 'id': 34,
//                 'protocol': 'LOCAL',
//                 'encoding': 'BASE64',
//                 'imageVersion': 'THUMBNAIL',
//                 'dataId': 'http://localhost:3000/api/item-images/8/THUMBNAIL',
//                 'itemImageId': 8,
//                 'updatedAt': 1543924144079,
//                 'createdAt': 1543924144079,
//                 'originalMime': null,
//                 'originalName': null
//             }]
//         }],
//         'ItemLocation': {
//             'id': 6,
//             'region': 'CA',
//             'address': 'a',
//             'itemInformationId': 6,
//             'updatedAt': 1543924105367,
//             'createdAt': 1543924105367,
//             'LocationMarker': { }
//         }

//     },
//     'PaymentInformation': {
//         'id': 6,
//         'type': 'SALE',
//         'listingItemId': 5,
//         'listingItemTemplateId': null,
//         'updatedAt': 1543924144143,
//         'createdAt': 1543924144143,
//         'Escrow': {
//             'id': 6,
//             'type': 'MAD',
//             'paymentInformationId': 6,
//             'updatedAt': 1543924144150,
//             'createdAt': 1543924144150,
//             'Ratio': {
//                 'id': 6,
//                 'buyer': 100,
//                 'seller': 100,
//                 'escrowId': 6,
//                 'updatedAt': 1543924144157,
//                 'createdAt': 1543924144157
//             }
//         },
//         'ItemPrice': {
//             'id': 6,
//             'currency': 'PARTICL',
//             'basePrice': 9999.99,
//             'paymentInformationId': 6,
//             'cryptocurrencyAddressId': null,
//             'updatedAt': 1543924144165,
//             'createdAt': 1543924144165,
//             'ShippingPrice':
//             'id': 6,
//             'domestic': 0,
//             'international': 0,
//             'itemPriceId': 6,
//             'updatedAt': 1543924144172,
//             'createdAt': 1543924144172
//         }
//     }
// },
// 'MessagingInformation': [],
// 'ListingItemObjects': [],
// 'ActionMessages': [{
//     'id': 5,
//     'action': 'MP_ITEM_ADD',
//     'nonce': null,
//     'accepted': null,
//     'listingItemId': 5,
//     'updatedAt': 1543924144218,
//     'createdAt': 1543924144218,
//     'MessageInfo': {},
//     'MessageObjects': [{
//         'id': 5,
//         'actionMessageId': 5,
//         'dataId': 'seller',
//         'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//         'updatedAt': 1543924144238,
//         'createdAt': 1543924144238
//     }],
//     'MessageEscrow': {},
//     'MessageData': {
//         'id': 5,
//         'actionMessageId': 5,
//         'msgid': '000000005c06266790c312eb5ee2aaea97e72d606e5779ca226d3d2b',
//         'version': '0300',
//         'received': '2018-12-04T11:47:20.000Z',
//         'sent': '2018-12-04T07:01:59.000Z',
//         'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//         'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//         'updatedAt': 1543924144229,
//         'createdAt': 1543924144229
//     }
// }],
// 'Bids': [],
// 'Market': {
//     'id': 1,
//     'name': 'DEFAULT',
//     'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//     'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//     'updatedAt': 1545807544987,
//     'createdAt': 1543920716143
// },
// 'FlaggedItem': { }
//         }

//     },
// {
//     'object': {
//         'id': 3,
//         'hash': 'b077c05d0959a9e0a803ff24aa69b6684e8d81e6b475513651ef47656c61021a',
//         'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//         'marketId': 1,
//         'listingItemTemplateId': null,
//         'expiryTime': 28,
//         'receivedAt': 1543924040000,
//         'postedAt': 1543870003000,
//         'expiredAt': 1546289203000,
//         'updatedAt': 1543924094003,
//         'createdAt': 1543924094003,
//         'ItemInformation': {
//             'id': 4,
//             'title': 'AK47',
//             'shortDescription': 'Premium AK47 ',
//             'longDescription': '\n\nBLEM PSAK-47 Liberty GB2 Classic Blonde Wood Rifle!\n\nA quality American standard AK built in America,
//             with all new manufactured parts and a premium standard of fit,
//             finish and workmanship.   From the nitride finished,
//             4150 steel,
//             barrel precision mated to a Billet barrel block,
//             to the 1mm stamped steel receiver,
//             the P\n\nSAK-47 was designed from the ground up to be a new standard in AK rifles.  \nThoroughly tested in development,
//             we tortured tested to 10,000 rounds to ensure a quality product.  \n\nThe 4150 barrel is nitride treated for accuracy and durability,
//             is matched to a billet bolt,
//             and is pressed into a new Billet steel machined barrel block to ensure the longevity AKs are known for. The classic polished American blonde hardwood furniture includes a  sling loop,
//             and the rifle comes complete with a 30 round Magpul magazine (where allowed by law).\n\nThis item is available online only.\n\nRifles must be shipped to a valid,
//             current Federal Firearms Licensee (FFL).    ',
//             'itemCategoryId': 76,
//             'listingItemId': 3,
//             'listingItemTemplateId': null,
//             'updatedAt': 1543924094020,
//             'createdAt': 1543924094020,
//             'ShippingDestinations': [],
//             'ItemCategory': {
//                 'id': 76,
//                 'key': 'cat_services_other',
//                 'name': 'Other',
//                 'description': '',
//                 'parentItemCategoryId': 68,
//                 'updatedAt': 1545807546318,
//                 'createdAt': 1543920717586,
//                 'ParentItemCategory': {
//                     'id': 68,
//                     'key': 'cat_services_corporate',
//                     'name': 'Services / Corporate',
//                     'description': '',
//                     'parentItemCategoryId': 1,
//                     'updatedAt': 1545807546193,
//                     'createdAt': 1543920717480,
//                     'ParentItemCategory': {
//                         'id': 1,
//                         'key': 'cat_ROOT',
//                         'name': 'ROOT',
//                         'description': 'root item category',
//                         'parentItemCategoryId': null,
//                         'updatedAt': 1545807545055,
//                         'createdAt': 1543920716188
//                     }
//                 }
//             },
//             'ItemImages': [{
//                 'id': 4,
//                 'hash': '5183f3637427495ebdc590df5ea0272687faf7a58dfce3ede8b43e478f5ca54f',
//                 'itemInformationId': 4,
//                 'updatedAt': 1543924094069,
//                 'createdAt': 1543924094069,
//                 'ItemImageDatas': [{
//                     'id': 13,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'ORIGINAL',
//                     'dataId': 'http://localhost:3000/api/item-images/4/ORIGINAL',
//                     'itemImageId': 4,
//                     'updatedAt': 1543924096051,
//                     'createdAt': 1543924096051,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 14,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'LARGE',
//                     'dataId': 'http://localhost:3000/api/item-images/4/LARGE',
//                     'itemImageId': 4,
//                     'updatedAt': 1543924096095,
//                     'createdAt': 1543924096095,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 15,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'MEDIUM',
//                     'dataId': 'http://localhost:3000/api/item-images/4/MEDIUM',
//                     'itemImageId': 4,
//                     'updatedAt': 1543924096243,
//                     'createdAt': 1543924096243,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 16,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'THUMBNAIL',
//                     'dataId': 'http://localhost:3000/api/item-images/4/THUMBNAIL',
//                     'itemImageId': 4,
//                     'updatedAt': 1543924096283,
//                     'createdAt': 1543924096283,
//                     'originalMime': null,
//                     'originalName': null
//                 }]
//             }],
//             'ItemLocation': {
//                 'id': 4,
//                 'region': 'US',
//                 'address': 'a',
//                 'itemInformationId': 4,
//                 'updatedAt': 1543924094028,
//                 'createdAt': 1543924094028,
//                 'LocationMarker': { }
//             }

//         },
//         'PaymentInformation': {
//             'id': 4,
//             'type': 'SALE',
//             'listingItemId': 3,
//             'listingItemTemplateId': null,
//             'updatedAt': 1543924096329,
//             'createdAt': 1543924096329,
//             'Escrow': {
//                 'id': 4,
//                 'type': 'MAD',
//                 'paymentInformationId': 4,
//                 'updatedAt': 1543924096336,
//                 'createdAt': 1543924096336,
//                 'Ratio': {
//                     'id': 4,
//                     'buyer': 100,
//                     'seller': 100,
//                     'escrowId': 4,
//                     'updatedAt': 1543924096343,
//                     'createdAt': 1543924096343
//                 }
//             },
//             'ItemPrice': {
//                 'id': 4,
//                 'currency': 'PARTICL',
//                 'basePrice': 299.99,
//                 'paymentInformationId': 4,
//                 'cryptocurrencyAddressId': null,
//                 'updatedAt': 1543924096351,
//                 'createdAt': 1543924096351,
//                 'ShippingPrice':
//                 'id': 4,
//                 'domestic': 0,
//                 'international': 0,
//                 'itemPriceId': 4,
//                 'updatedAt': 1543924096360,
//                 'createdAt': 1543924096360
//             }
//         }
//     },
//     'MessagingInformation': [],
//     'ListingItemObjects': [],
//     'ActionMessages': [{
//         'id': 3,
//         'action': 'MP_ITEM_ADD',
//         'nonce': null,
//         'accepted': null,
//         'listingItemId': 3,
//         'updatedAt': 1543924096401,
//         'createdAt': 1543924096401,
//         'MessageInfo': {},
//         'MessageObjects': [{
//             'id': 3,
//             'actionMessageId': 3,
//             'dataId': 'seller',
//             'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'updatedAt': 1543924096419,
//             'createdAt': 1543924096419
//         }],
//         'MessageEscrow': {},
//         'MessageData': {
//             'id': 3,
//             'actionMessageId': 3,
//             'msgid': '000000005c059633eb9721fd01a817156364bd16ae312cf6f295dd77',
//             'version': '0300',
//             'received': '2018-12-04T11:47:20.000Z',
//             'sent': '2018-12-03T20:46:43.000Z',
//             'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//             'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//             'updatedAt': 1543924096411,
//             'createdAt': 1543924096411
//         }
//     }],
//     'Bids': [],
//     'Market': {
//         'id': 1,
//         'name': 'DEFAULT',
//         'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//         'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//         'updatedAt': 1545807544987,
//         'createdAt': 1543920716143
//     },
//     'FlaggedItem': {
//         'id': 4,
//         'listingItemId': 3,
//         'proposalId': 36,
//         'reason': 'This ListingItem should be removed.',
//         'updatedAt': 1543928307564,
//         'createdAt': 1543928307564,
//         'Proposal': {
//             'id': 36,
//             'submitter': 'pXsZAJTHMxivMPVHu9e3veazWm7146Aiuk',
//             'hash': '103f3470eb3dfff2c58936fcb701dbdb1e48921ed02bd8e2fa90258e58593b11',
//             'item': 'b077c05d0959a9e0a803ff24aa69b6684e8d81e6b475513651ef47656c61021a',
//             'type': 'ITEM_VOTE',
//             'title': 'b077c05d0959a9e0a803ff24aa69b6684e8d81e6b475513651ef47656c61021a',
//             'description': 'This ListingItem should be removed.',
//             'timeStart': 1543928284000,
//             'postedAt': 1543928284000,
//             'receivedAt': 1543928286000,
//             'expiredAt': 1544101084000,
//             'updatedAt': 1543928307503,
//             'createdAt': 1543928307503,
//             'ProposalOptions': [{
//                 'id': 86,
//                 'proposalId': 36,
//                 'optionId': 0,
//                 'description': 'KEEP',
//                 'hash': '55727e9134f43caa19018cad6892970d06edbbbc5d632d0e744c42ef5af03919',
//                 'updatedAt': 1543928307516,
//                 'createdAt': 1543928307516
//             },
//             {
//                 'id': 87,
//                 'proposalId': 36,
//                 'optionId': 1,
//                 'description': 'REMOVE',
//                 'hash': '3f8a9be1662e2ec12bb523b98eb07c936e4bdf84a418d487ad450da4d5457153',
//                 'updatedAt': 1543928307528,
//                 'createdAt': 1543928307528
//             }]
//         }
//     }

// },
// 'category': {
//     'category': {
//         'id': 76,
//         'key': 'cat_services_other',
//         'name': 'Other',
//         'description': '',
//         'parentItemCategoryId': 68,
//         'updatedAt': 1545807546318,
//         'createdAt': 1543920717586,
//         'ParentItemCategory':
//         'id': 68,
//         'key': 'cat_services_corporate',
//         'name': 'Services / Corporate',
//         'description': '',
//         'parentItemCategoryId': 1,
//         'updatedAt': 1545807546193,
//         'createdAt': 1543920717480,
//         'ParentItemCategory':
//         'id': 1,
//         'key': 'cat_ROOT',
//         'name': 'ROOT',
//         'description': 'root item category',
//         'parentItemCategoryId': null,
//         'updatedAt': 1545807545055,
//         'createdAt': 1543920716188
//     }
// } }
//      },
//      'createdAt': '04-12-2018',
//      'status': 'unpublished',
//      'basePrice': {
//     'amount': 299.99,
//     'maxRoundingDigits': 8
// },
// 'domesticShippingPrice': {
//     'amount': 0,
//     'maxRoundingDigits': 8
// },
// 'internationalShippingPrice': {
//     'amount': 0,
//     'maxRoundingDigits': 8
// },
// 'escrowPriceInternational': {
//     'amount': 299.99,
//     'maxRoundingDigits': 8
// }, 'escrowPriceDomestic': {
//     'amount': 299.99, 'maxRoundingDigits': 8
// }, 'domesticTotal': {
//     'amount': 299.99, 'maxRoundingDigits': 8
// }, 'internationalTotal': {
//     'amount': 299.99, 'maxRoundingDigits': 8
// }, 'totalAmountInternaltional': {
//     'amount': 599.98, 'maxRoundingDigits': 8
// }, 'totalAmountDomestic': {
//     'amount': 599.98, 'maxRoundingDigits': 8
// }, 'memo': '', 'expireTime': 4, 'isFlagged': true, 'proposalHash': '103f3470eb3dfff2c58936fcb701dbdb1e48921ed02bd8e2fa90258e58593b11', 'submitterAddress': 'pXsZAJTHMxivMPVHu9e3veazWm7146Aiuk', 'imageCollection': {
//     'images': [{
//         'image': {
//             'id': 4, 'hash': '5183f3637427495ebdc590df5ea0272687faf7a58dfce3ede8b43e478f5ca54f', 'itemInformationId': 4, 'updatedAt': 1543924094069, 'createdAt': 1543924094069, 'ItemImageDatas': [{
//                 'id': 13, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'ORIGINAL', 'dataId': 'http://localhost:3000/api/item-images/4/ORIGINAL', 'itemImageId': 4, 'updatedAt': 1543924096051, 'createdAt': 1543924096051, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 14, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'LARGE', 'dataId': 'http://localhost:3000/api/item-images/4/LARGE', 'itemImageId': 4, 'updatedAt': 1543924096095, 'createdAt': 1543924096095, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 15, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'MEDIUM', 'dataId': 'http://localhost:3000/api/item-images/4/MEDIUM', 'itemImageId': 4, 'updatedAt': 1543924096243, 'createdAt': 1543924096243, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 16, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'THUMBNAIL', 'dataId': 'http://localhost:3000/api/item-images/4/THUMBNAIL', 'itemImageId': 4, 'updatedAt': 1543924096283, 'createdAt': 1543924096283, 'originalMime': null, 'originalName': null
//             }]
//         }
//     }], 'default': {
//         'image': { 'ItemImageDatas': [] }
//     }, 'imageItems': [{ 'data': { 'src': 'http://localhost:3000/api/item-images/4/MEDIUM', 'thumb': 'http://localhost:3000/api/item-images/4/THUMBNAIL' } }], 'preview': {
//         'image': {
//             'id': 4, 'hash': '5183f3637427495ebdc590df5ea0272687faf7a58dfce3ede8b43e478f5ca54f', 'itemInformationId': 4, 'updatedAt': 1543924094069, 'createdAt': 1543924094069, 'ItemImageDatas': [{
//                 'id': 13, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'ORIGINAL', 'dataId': 'http://localhost:3000/api/item-images/4/ORIGINAL', 'itemImageId': 4, 'updatedAt': 1543924096051, 'createdAt': 1543924096051, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 14, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'LARGE', 'dataId': 'http://localhost:3000/api/item-images/4/LARGE', 'itemImageId': 4, 'updatedAt': 1543924096095, 'createdAt': 1543924096095, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 15, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'MEDIUM', 'dataId': 'http://localhost:3000/api/item-images/4/MEDIUM', 'itemImageId': 4, 'updatedAt': 1543924096243, 'createdAt': 1543924096243, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 16, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'THUMBNAIL', 'dataId': 'http://localhost:3000/api/item-images/4/THUMBNAIL', 'itemImageId': 4, 'updatedAt': 1543924096283, 'createdAt': 1543924096283, 'originalMime': null, 'originalName': null
//             }]
//         }
//     }

// }, 'keepItem': {
//     'id': 86, 'proposalId': 36, 'optionId': 0, 'description': 'KEEP', 'hash': '55727e9134f43caa19018cad6892970d06edbbbc5d632d0e744c42ef5af03919', 'updatedAt': 1543928307516, 'createdAt': 1543928307516
// }, 'removeItem': {
//     'id': 87, 'proposalId': 36, 'optionId': 1, 'description': 'REMOVE', 'hash': '3f8a9be1662e2ec12bb523b98eb07c936e4bdf84a418d487ad450da4d5457153', 'updatedAt': 1543928307528, 'createdAt': 1543928307528
// }, 'listing': {
//     'id': 3, 'hash': 'b077c05d0959a9e0a803ff24aa69b6684e8d81e6b475513651ef47656c61021a', 'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg', 'marketId': 1, 'listingItemTemplateId': null, 'expiryTime': 28, 'receivedAt': 1543924040000, 'postedAt': 1543870003000, 'expiredAt': 1546289203000, 'updatedAt': 1543924094003, 'createdAt': 1543924094003, 'ItemInformation': {
//         'id': 4, 'title': 'AK47', 'shortDescription': 'Premium AK47 ', 'longDescription': '\n\nBLEM PSAK-47 Liberty GB2 Classic Blonde Wood Rifle!\n\nA quality American standard AK built in America, with all new manufactured parts and a premium standard of fit, finish and workmanship.   From the nitride finished, 4150 steel, barrel precision mated to a Billet barrel block, to the 1mm stamped steel receiver, the P\n\nSAK-47 was designed from the ground up to be a new standard in AK rifles.  \nThoroughly tested in development, we tortured tested to 10,000 rounds to ensure a quality product.  \n\nThe 4150 barrel is nitride treated for accuracy and durability, is matched to a billet bolt, and is pressed into a new Billet steel machined barrel block to ensure the longevity AKs are known for. The classic polished American blonde hardwood furniture includes a  sling loop, and the rifle comes complete with a 30 round Magpul magazine (where allowed by law).\n\nThis item is available online only.\n\nRifles must be shipped to a valid, current Federal Firearms Licensee (FFL).    ', 'itemCategoryId': 76, 'listingItemId': 3, 'listingItemTemplateId': null, 'updatedAt': 1543924094020, 'createdAt': 1543924094020, 'ShippingDestinations': [], 'ItemCategory': {
//             'id': 76, 'key': 'cat_services_other', 'name': 'Other', 'description': '', 'parentItemCategoryId': 68, 'updatedAt': 1545807546318, 'createdAt': 1543920717586, 'ParentItemCategory': {
//                 'id': 68, 'key': 'cat_services_corporate', 'name': 'Services / Corporate', 'description': '', 'parentItemCategoryId': 1, 'updatedAt': 1545807546193, 'createdAt': 1543920717480, 'ParentItemCategory': {
//                     'id': 1, 'key': 'cat_ROOT', 'name': 'ROOT', 'description': 'root item category', 'parentItemCategoryId': null, 'updatedAt': 1545807545055, 'createdAt': 1543920716188
//                 }
//             }
//         }, 'ItemImages': [{
//             'id': 4, 'hash': '5183f3637427495ebdc590df5ea0272687faf7a58dfce3ede8b43e478f5ca54f', 'itemInformationId': 4, 'updatedAt': 1543924094069, 'createdAt': 1543924094069, 'ItemImageDatas': [{
//                 'id': 13, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'ORIGINAL', 'dataId': 'http://localhost:3000/api/item-images/4/ORIGINAL', 'itemImageId': 4, 'updatedAt': 1543924096051, 'createdAt': 1543924096051, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 14, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'LARGE', 'dataId': 'http://localhost:3000/api/item-images/4/LARGE', 'itemImageId': 4, 'updatedAt': 1543924096095, 'createdAt': 1543924096095, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 15, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'MEDIUM', 'dataId': 'http://localhost:3000/api/item-images/4/MEDIUM', 'itemImageId': 4, 'updatedAt': 1543924096243, 'createdAt': 1543924096243, 'originalMime': null, 'originalName': null
//             },
//             {
//                 'id': 16, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'THUMBNAIL', 'dataId': 'http://localhost:3000/api/item-images/4/THUMBNAIL', 'itemImageId': 4, 'updatedAt': 1543924096283, 'createdAt': 1543924096283, 'originalMime': null, 'originalName': null
//             }]
//         }], 'ItemLocation': {
//             'id': 4, 'region': 'US', 'address': 'a', 'itemInformationId': 4, 'updatedAt': 1543924094028, 'createdAt': 1543924094028, 'LocationMarker': { }
//         }

//     }, 'PaymentInformation': {
//         'id': 4, 'type': 'SALE', 'listingItemId': 3, 'listingItemTemplateId': null, 'updatedAt': 1543924096329, 'createdAt': 1543924096329, 'Escrow': {
//             'id': 4, 'type': 'MAD', 'paymentInformationId': 4, 'updatedAt': 1543924096336, 'createdAt': 1543924096336, 'Ratio': {
//                 'id': 4, 'buyer': 100, 'seller': 100, 'escrowId': 4, 'updatedAt': 1543924096343, 'createdAt': 1543924096343
//             }
//         }, 'ItemPrice': {
//             'id': 4, 'currency': 'PARTICL', 'basePrice': 299.99, 'paymentInformationId': 4, 'cryptocurrencyAddressId': null, 'updatedAt': 1543924096351, 'createdAt': 1543924096351, 'ShippingPrice':
//             'id': 4, 'domestic': 0, 'international': 0, 'itemPriceId': 4, 'updatedAt': 1543924096360, 'createdAt': 1543924096360
//         }
//     }
// }, 'MessagingInformation': [], 'ListingItemObjects': [], 'ActionMessages': [{
//     'id': 3, 'action': 'MP_ITEM_ADD', 'nonce': null, 'accepted': null, 'listingItemId': 3, 'updatedAt': 1543924096401, 'createdAt': 1543924096401, 'MessageInfo': {}, 'MessageObjects': [{
//         'id': 3, 'actionMessageId': 3, 'dataId': 'seller', 'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg', 'updatedAt': 1543924096419, 'createdAt': 1543924096419
//     }], 'MessageEscrow': {}, 'MessageData': {
//         'id': 3, 'actionMessageId': 3, 'msgid': '000000005c059633eb9721fd01a817156364bd16ae312cf6f295dd77', 'version': '0300', 'received': '2018-12-04T11:47:20.000Z', 'sent': '2018-12-03T20:46:43.000Z', 'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg', 'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA', 'updatedAt': 1543924096411, 'createdAt': 1543924096411
//     }
// }], 'Bids': [], 'Market': {
//     'id': 1, 'name': 'DEFAULT', 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek', 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA', 'updatedAt': 1545807544987, 'createdAt': 1543920716143
// }, 'FlaggedItem': {
//     'id': 4, 'listingItemId': 3, 'proposalId': 36, 'reason': 'This ListingItem should be removed.', 'updatedAt': 1543928307564, 'createdAt': 1543928307564, 'Proposal': {
//         'id': 36, 'submitter': 'pXsZAJTHMxivMPVHu9e3veazWm7146Aiuk', 'hash': '103f3470eb3dfff2c58936fcb701dbdb1e48921ed02bd8e2fa90258e58593b11', 'item': 'b077c05d0959a9e0a803ff24aa69b6684e8d81e6b475513651ef47656c61021a', 'type': 'ITEM_VOTE', 'title': 'b077c05d0959a9e0a803ff24aa69b6684e8d81e6b475513651ef47656c61021a', 'description': 'This ListingItem should be removed.', 'timeStart': 1543928284000, 'postedAt': 1543928284000, 'receivedAt': 1543928286000, 'expiredAt': 1544101084000, 'updatedAt': 1543928307503, 'createdAt': 1543928307503, 'ProposalOptions': [{
//             'id': 86, 'proposalId': 36, 'optionId': 0, 'description': 'KEEP', 'hash': '55727e9134f43caa19018cad6892970d06edbbbc5d632d0e744c42ef5af03919', 'updatedAt': 1543928307516, 'createdAt': 1543928307516
//         },
//         {
//             'id': 87, 'proposalId': 36, 'optionId': 1, 'description': 'REMOVE', 'hash': '3f8a9be1662e2ec12bb523b98eb07c936e4bdf84a418d487ad450da4d5457153', 'updatedAt': 1543928307528, 'createdAt': 1543928307528
//         }]
//     }
// }
//         }

//     },
// {
//     'object': {
//         'id': 2, 'hash': '98067de6ee3ebfd49b96dde34fdf90310c911b135557cb818d71f50a3cacba6f', 'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg', 'marketId': 1, 'listingItemTemplateId': null, 'expiryTime': 28, 'receivedAt': 1543924040000, 'postedAt': 1543869192000, 'expiredAt': 1546288392000, 'updatedAt': 1543924086834, 'createdAt': 1543924086834, 'ItemInformation': {
//             'id': 3, 'title': 'Warehouse full of STUFF', 'shortDescription': 'This listing represent warehouse lotery. ', 'longDescription': 'Buy this listing and be suprized by winning random delivered good.\n\nSeller: Belgium Premium GOODS Lottery ', 'itemCategoryId': 82, 'listingItemId': 2, 'listingItemTemplateId': null, 'updatedAt': 1543924086847, 'createdAt': 1543924086847, 'ShippingDestinations': [], 'ItemCategory': {
//                 'id': 82, 'key': 'cat_wholesale_other', 'name': 'Other', 'description': '', 'parentItemCategoryId': 77, 'updatedAt': 1545807546402, 'createdAt': 1543920717658, 'ParentItemCategory': {
//                     'id': 77, 'key': 'cat_wholesale_science_industrial', 'name': 'Wholesale / Science & Industrial Products', 'description': '', 'parentItemCategoryId': 1, 'updatedAt': 1545807546334, 'createdAt': 1543920717597, 'ParentItemCategory': {
//                         'id': 1, 'key': 'cat_ROOT', 'name': 'ROOT', 'description': 'root item category', 'parentItemCategoryId': null, 'updatedAt': 1545807545055, 'createdAt': 1543920716188
//                     }
//                 }
//             }, 'ItemImages': [{
//                 'id': 3, 'hash': '632275461c1b39a404828d157e47bbc416d5065293f9ceb1e2a4af44958576b3', 'itemInformationId': 3, 'updatedAt': 1543924086916, 'createdAt': 1543924086916, 'ItemImageDatas': [{
//                     'id': 9, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'ORIGINAL', 'dataId': 'http://localhost:3000/api/item-images/3/ORIGINAL', 'itemImageId': 3, 'updatedAt': 1543924092888, 'createdAt': 1543924092888, 'originalMime': null, 'originalName': null
//                 },
//                 {
//                     'id': 10, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'LARGE', 'dataId': 'http://localhost:3000/api/item-images/3/LARGE', 'itemImageId': 3, 'updatedAt': 1543924092973, 'createdAt': 1543924092973, 'originalMime': null, 'originalName': null
//                 },
//                 {
//                     'id': 11, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'MEDIUM', 'dataId': 'http://localhost:3000/api/item-images/3/MEDIUM', 'itemImageId': 3, 'updatedAt': 1543924093042, 'createdAt': 1543924093042, 'originalMime': null, 'originalName': null
//                 },
//                 {
//                     'id': 12, 'protocol': 'LOCAL', 'encoding': 'BASE64', 'imageVersion': 'THUMBNAIL', 'dataId': 'http://localhost:3000/api/item-images/3/THUMBNAIL', 'itemImageId': 3, 'updatedAt': 1543924093075, 'createdAt': 1543924093075, 'originalMime': null, 'originalName': null
//                 }]
//             }], 'ItemLocation': {
//                 'id': 3, 'region': 'BE', 'address': 'a', 'itemInformationId': 3, 'updatedAt': 1543924086854, 'createdAt': 1543924086854, 'LocationMarker': { }
//             }

//         },
//         'PaymentInformation': {
//             'id': 3,
//                 'type': 'SALE',
//                     'listingItemId': 2,
//                         'listingItemTemplateId': null,
//                             'updatedAt': 1543924093124,
//                                 'createdAt': 1543924093124,
//                                     'Escrow': {
//                 'id': 3,
//                     'type': 'MAD',
//                         'paymentInformationId': 3,
//                             'updatedAt': 1543924093132,
//                                 'createdAt': 1543924093132,
//                                     'Ratio': {
//                     'id': 3,
//                         'buyer': 100,
//                             'seller': 100,
//                                 'escrowId': 3,
//                                     'updatedAt': 1543924093143,
//                                         'createdAt': 1543924093143
//                 }
//             },
//             'ItemPrice': {
//                 'id': 3,
//                     'currency': 'PARTICL',
//                         'basePrice': 9.99,
//                             'paymentInformationId': 3,
//                                 'cryptocurrencyAddressId': null,
//                                     'updatedAt': 1543924093153,
//                                         'createdAt': 1543924093153,
//                                             'ShippingPrice': {
//                     'id': 3,
//                         'domestic': 1,
//                             'international': 2,
//                                 'itemPriceId': 3,
//                                     'updatedAt': 1543924093161,
//                                         'createdAt': 1543924093161
//                 }
//             }
//         },
//         'MessagingInformation': [],
//             'ListingItemObjects': [],
//                 'ActionMessages': [{
//                     'id': 2,
//                     'action': 'MP_ITEM_ADD',
//                     'nonce': null,
//                     'accepted': null,
//                     'listingItemId': 2,
//                     'updatedAt': 1543924093202,
//                     'createdAt': 1543924093202,
//                     'MessageInfo': {},
//                     'MessageObjects': [{
//                         'id': 2,
//                         'actionMessageId': 2,
//                         'dataId': 'seller',
//                         'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                         'updatedAt': 1543924093218,
//                         'createdAt': 1543924093218
//                     }],
//                     'MessageEscrow': {},
//                     'MessageData': {
//                         'id': 2,
//                         'actionMessageId': 2,
//                         'msgid': '000000005c05930878f6c84dc446142e5bec02cfacc3c12ee5a1cb11',
//                         'version': '0300',
//                         'received': '2018-12-04T11:47:20.000Z',
//                         'sent': '2018-12-03T20:33:12.000Z',
//                         'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                         'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                         'updatedAt': 1543924093211,
//                         'createdAt': 1543924093211
//                     }
//                 }],
//                     'Bids': [],
//                         'Market': {
//             'id': 1,
//                 'name': 'DEFAULT',
//                     'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                         'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                             'updatedAt': 1545807544987,
//                                 'createdAt': 1543920716143
//         },
//         'FlaggedItem': { }

//     },
//     'category': {
//         'category': {
//             'id': 82,
//                 'key': 'cat_wholesale_other',
//                     'name': 'Other',
//                         'description': '',
//                             'parentItemCategoryId': 77,
//                                 'updatedAt': 1545807546402,
//                                     'createdAt': 1543920717658,
//                                         'ParentItemCategory': {
//                 'id': 77,
//                     'key': 'cat_wholesale_science_industrial',
//                         'name': 'Wholesale / Science & Industrial Products',
//                             'description': '',
//                                 'parentItemCategoryId': 1,
//                                     'updatedAt': 1545807546334,
//                                         'createdAt': 1543920717597,
//                                             'ParentItemCategory': {
//                     'id': 1,
//                         'key': 'cat_ROOT',
//                             'name': 'ROOT',
//                                 'description': 'root item category',
//                                     'parentItemCategoryId': null,
//                                         'updatedAt': 1545807545055,
//                                             'createdAt': 1543920716188
//                 }
//             }
//         }
//     },
//     'createdAt': '04-12-2018',
//         'status': 'unpublished',
//             'basePrice': {
//         'amount': 9.99,
//             'maxRoundingDigits': 8
//     },
//     'domesticShippingPrice': {
//         'amount': 1,
//             'maxRoundingDigits': 8
//     },
//     'internationalShippingPrice': {
//         'amount': 2,
//             'maxRoundingDigits': 8
//     },
//     'escrowPriceInternational': {
//         'amount': 11.99,
//             'maxRoundingDigits': 8
//     },
//     'escrowPriceDomestic': {
//         'amount': 10.99,
//             'maxRoundingDigits': 8
//     },
//     'domesticTotal': {
//         'amount': 10.99,
//             'maxRoundingDigits': 8
//     },
//     'internationalTotal': {
//         'amount': 11.99,
//             'maxRoundingDigits': 8
//     },
//     'totalAmountInternaltional': {
//         'amount': 23.98,
//             'maxRoundingDigits': 8
//     },
//     'totalAmountDomestic': {
//         'amount': 21.98,
//             'maxRoundingDigits': 8
//     },
//     'memo': '',
//         'expireTime': 4,
//             'isFlagged': false,
//                 'proposalHash': '',
//                     'submitterAddress': '',
//                         'imageCollection': {
//         'images': [{
//             'image': {
//                 'id': 3,
//                 'hash': '632275461c1b39a404828d157e47bbc416d5065293f9ceb1e2a4af44958576b3',
//                 'itemInformationId': 3,
//                 'updatedAt': 1543924086916,
//                 'createdAt': 1543924086916,
//                 'ItemImageDatas': [{
//                     'id': 9,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'ORIGINAL',
//                     'dataId': 'http://localhost:3000/api/item-images/3/ORIGINAL',
//                     'itemImageId': 3,
//                     'updatedAt': 1543924092888,
//                     'createdAt': 1543924092888,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 10,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'LARGE',
//                     'dataId': 'http://localhost:3000/api/item-images/3/LARGE',
//                     'itemImageId': 3,
//                     'updatedAt': 1543924092973,
//                     'createdAt': 1543924092973,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 11,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'MEDIUM',
//                     'dataId': 'http://localhost:3000/api/item-images/3/MEDIUM',
//                     'itemImageId': 3,
//                     'updatedAt': 1543924093042,
//                     'createdAt': 1543924093042,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 12,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'THUMBNAIL',
//                     'dataId': 'http://localhost:3000/api/item-images/3/THUMBNAIL',
//                     'itemImageId': 3,
//                     'updatedAt': 1543924093075,
//                     'createdAt': 1543924093075,
//                     'originalMime': null,
//                     'originalName': null
//                 }]
//             }
//         }],
//             'default': {
//             'image': { 'ItemImageDatas': [] }
//         },
//         'imageItems': [{
//             'data': {
//                 'src': 'http://localhost:3000/api/item-images/3/MEDIUM',
//                 'thumb': 'http://localhost:3000/api/item-images/3/THUMBNAIL'
//             }
//         }],
//             'preview': {
//             'image': {
//                 'id': 3,
//                     'hash': '632275461c1b39a404828d157e47bbc416d5065293f9ceb1e2a4af44958576b3',
//                         'itemInformationId': 3,
//                             'updatedAt': 1543924086916,
//                                 'createdAt': 1543924086916,
//                                     'ItemImageDatas': [{
//                                         'id': 9,
//                                         'protocol': 'LOCAL',
//                                         'encoding': 'BASE64',
//                                         'imageVersion': 'ORIGINAL',
//                                         'dataId': 'http://localhost:3000/api/item-images/3/ORIGINAL',
//                                         'itemImageId': 3,
//                                         'updatedAt': 1543924092888,
//                                         'createdAt': 1543924092888,
//                                         'originalMime': null,
//                                         'originalName': null
//                                     },
//                                     {
//                                         'id': 10,
//                                         'protocol': 'LOCAL',
//                                         'encoding': 'BASE64',
//                                         'imageVersion': 'LARGE',
//                                         'dataId': 'http://localhost:3000/api/item-images/3/LARGE',
//                                         'itemImageId': 3,
//                                         'updatedAt': 1543924092973,
//                                         'createdAt': 1543924092973,
//                                         'originalMime': null,
//                                         'originalName': null
//                                     },
//                                     {
//                                         'id': 11,
//                                         'protocol': 'LOCAL',
//                                         'encoding': 'BASE64',
//                                         'imageVersion': 'MEDIUM',
//                                         'dataId': 'http://localhost:3000/api/item-images/3/MEDIUM',
//                                         'itemImageId': 3,
//                                         'updatedAt': 1543924093042,
//                                         'createdAt': 1543924093042,
//                                         'originalMime': null,
//                                         'originalName': null
//                                     },
//                                     {
//                                         'id': 12,
//                                         'protocol': 'LOCAL',
//                                         'encoding': 'BASE64',
//                                         'imageVersion': 'THUMBNAIL',
//                                         'dataId': 'http://localhost:3000/api/item-images/3/THUMBNAIL',
//                                         'itemImageId': 3,
//                                         'updatedAt': 1543924093075,
//                                         'createdAt': 1543924093075,
//                                         'originalMime': null,
//                                         'originalName': null
//                                     }]
//             }
//         }

//     },
//     'listing': {
//         'id': 2,
//             'hash': '98067de6ee3ebfd49b96dde34fdf90310c911b135557cb818d71f50a3cacba6f',
//                 'seller': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                     'marketId': 1,
//                         'listingItemTemplateId': null,
//                             'expiryTime': 28,
//                                 'receivedAt': 1543924040000,
//                                     'postedAt': 1543869192000,
//                                         'expiredAt': 1546288392000,
//                                             'updatedAt': 1543924086834,
//                                                 'createdAt': 1543924086834,
//                                                     'ItemInformation': {
//             'id': 3,
//                 'title': 'Warehouse full of STUFF',
//                     'shortDescription': 'This listing represent warehouse lotery. ',
//                         'longDescription': 'Buy this listing and be suprized by winning random delivered good.\n\nSeller: Belgium Premium GOODS Lottery ',
//                             'itemCategoryId': 82,
//                                 'listingItemId': 2,
//                                     'listingItemTemplateId': null,
//                                         'updatedAt': 1543924086847,
//                                             'createdAt': 1543924086847,
//                                                 'ShippingDestinations': [],
//                                                     'ItemCategory': {
//                 'id': 82,
//                     'key': 'cat_wholesale_other',
//                         'name': 'Other',
//                             'description': '',
//                                 'parentItemCategoryId': 77,
//                                     'updatedAt': 1545807546402,
//                                         'createdAt': 1543920717658,
//                                             'ParentItemCategory': {
//                     'id': 77,
//                         'key': 'cat_wholesale_science_industrial',
//                             'name': 'Wholesale / Science & Industrial Products',
//                                 'description': '',
//                                     'parentItemCategoryId': 1,
//                                         'updatedAt': 1545807546334,
//                                             'createdAt': 1543920717597,
//                                                 'ParentItemCategory': {
//                         'id': 1,
//                             'key': 'cat_ROOT',
//                                 'name': 'ROOT',
//                                     'description': 'root item category',
//                                         'parentItemCategoryId': null,
//                                             'updatedAt': 1545807545055,
//                                                 'createdAt': 1543920716188
//                     }
//                 }
//             },
//             'ItemImages': [{
//                 'id': 3,
//                 'hash': '632275461c1b39a404828d157e47bbc416d5065293f9ceb1e2a4af44958576b3',
//                 'itemInformationId': 3,
//                 'updatedAt': 1543924086916,
//                 'createdAt': 1543924086916,
//                 'ItemImageDatas': [{
//                     'id': 9,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'ORIGINAL',
//                     'dataId': 'http://localhost:3000/api/item-images/3/ORIGINAL',
//                     'itemImageId': 3,
//                     'updatedAt': 1543924092888,
//                     'createdAt': 1543924092888,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 10,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'LARGE',
//                     'dataId': 'http://localhost:3000/api/item-images/3/LARGE',
//                     'itemImageId': 3,
//                     'updatedAt': 1543924092973,
//                     'createdAt': 1543924092973,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 11,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'MEDIUM',
//                     'dataId': 'http://localhost:3000/api/item-images/3/MEDIUM',
//                     'itemImageId': 3,
//                     'updatedAt': 1543924093042,
//                     'createdAt': 1543924093042,
//                     'originalMime': null,
//                     'originalName': null
//                 },
//                 {
//                     'id': 12,
//                     'protocol': 'LOCAL',
//                     'encoding': 'BASE64',
//                     'imageVersion': 'THUMBNAIL',
//                     'dataId': 'http://localhost:3000/api/item-images/3/THUMBNAIL',
//                     'itemImageId': 3,
//                     'updatedAt': 1543924093075,
//                     'createdAt': 1543924093075,
//                     'originalMime': null,
//                     'originalName': null
//                 }]
//             }],
//                 'ItemLocation': {
//                 'id': 3,
//                     'region': 'BE',
//                         'address': 'a',
//                             'itemInformationId': 3,
//                                 'updatedAt': 1543924086854,
//                                     'createdAt': 1543924086854,
//                                         'LocationMarker': { }
//             }

//         },
//         'PaymentInformation': {
//             'id': 3,
//                 'type': 'SALE',
//                     'listingItemId': 2,
//                         'listingItemTemplateId': null,
//                             'updatedAt': 1543924093124,
//                                 'createdAt': 1543924093124,
//                                     'Escrow': {
//                 'id': 3,
//                     'type': 'MAD',
//                         'paymentInformationId': 3,
//                             'updatedAt': 1543924093132,
//                                 'createdAt': 1543924093132,
//                                     'Ratio': {
//                     'id': 3,
//                         'buyer': 100,
//                             'seller': 100,
//                                 'escrowId': 3,
//                                     'updatedAt': 1543924093143,
//                                         'createdAt': 1543924093143
//                 }
//             },
//             'ItemPrice': {
//                 'id': 3,
//                     'currency': 'PARTICL',
//                         'basePrice': 9.99,
//                             'paymentInformationId': 3,
//                                 'cryptocurrencyAddressId': null,
//                                     'updatedAt': 1543924093153,
//                                         'createdAt': 1543924093153,
//                                             'ShippingPrice': {
//                     'id': 3,
//                         'domestic': 1,
//                             'international': 2,
//                                 'itemPriceId': 3,
//                                     'updatedAt': 1543924093161,
//                                         'createdAt': 1543924093161
//                 }
//             }
//         },
//         'MessagingInformation': [],
//             'ListingItemObjects': [],
//                 'ActionMessages': [{
//                     'id': 2,
//                     'action': 'MP_ITEM_ADD',
//                     'nonce': null,
//                     'accepted': null,
//                     'listingItemId': 2,
//                     'updatedAt': 1543924093202,
//                     'createdAt': 1543924093202,
//                     'MessageInfo': {},
//                     'MessageObjects': [{
//                         'id': 2,
//                         'actionMessageId': 2,
//                         'dataId': 'seller',
//                         'dataValue': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                         'updatedAt': 1543924093218,
//                         'createdAt': 1543924093218
//                     }],
//                     'MessageEscrow': {},
//                     'MessageData': {
//                         'id': 2,
//                         'actionMessageId': 2,
//                         'msgid': '000000005c05930878f6c84dc446142e5bec02cfacc3c12ee5a1cb11',
//                         'version': '0300',
//                         'received': '2018-12-04T11:47:20.000Z',
//                         'sent': '2018-12-03T20:33:12.000Z',
//                         'from': 'pVuFs5ehuTSRJyBy9Bs4JweUVsz9YAHDNg',
//                         'to': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                         'updatedAt': 1543924093211,
//                         'createdAt': 1543924093211
//                     }
//                 }],
//                     'Bids': [],
//             'Market': {
//                 'id': 1,
//                 'name': 'DEFAULT',
//                 'privateKey': '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
//                 'address': 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
//                 'updatedAt': 1545807544987,
//                 'createdAt': 1543920716143
//             },
//             'FlaggedItem': { }
//         }
//     }
// ]
