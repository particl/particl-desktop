const paymentUpdate = {
  'id': 5,
  'type': 'SALE',
  'listingItemId': null,
  'listingItemTemplateId': 1,
  'updatedAt': 1546847793049,
  'createdAt': 1546680317754,
  'Escrow': {
    'id': 5,
    'type': 'MAD',
    'paymentInformationId': 5,
    'updatedAt': 1546847792965,
    'createdAt': 1546680317946,
    'Ratio': {
      'id': 7,
      'buyer': 100,
      'seller': 100,
      'escrowId': 5,
      'updatedAt': 1546847792980,
      'createdAt': 1546847792980
    }
  },
  'ItemPrice': {
    'id': 7,
    'currency': 'PARTICL',
    'basePrice': 1,
    'paymentInformationId': 5,
    'cryptocurrencyAddressId': null,
    'updatedAt': 1546847793072,
    'createdAt': 1546847793072,
    'ShippingPrice': {
      'id': 7,
      'domestic': 12,
      'international': 1,
      'itemPriceId': 7,
      'updatedAt': 1546847793082,
      'createdAt': 1546847793082
    }
  }
}

export {
  paymentUpdate
}
