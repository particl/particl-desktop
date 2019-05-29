const categories = [{
  'id': 1,
  'key': 'cat_ROOT',
  'name': 'ROOT',
  'description': 'root item category',
  'parentItemCategoryId': null,
  'updatedAt': 1559113803113,
  'createdAt': 1557916310239,
  'ChildItemCategories': [{
    'id': 2,
    'key': 'cat_particl',
    'name': 'Particl',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113803137,
    'createdAt': 1557916310270,
    'ChildItemCategories': [{
      'id': 3,
      'key': 'cat_particl_free_swag',
      'name': 'Free Swag',
      'description': '',
      'parentItemCategoryId': 2,
      'updatedAt': 1559113803167,
      'createdAt': 1557916310294,
      'ChildItemCategories': []
    }]
  }, {
    'id': 4,
    'key': 'cat_high_value',
    'name': 'High Value (10,000$+)',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113803195,
    'createdAt': 1557916310327,
    'ChildItemCategories': [{
      'id': 5,
      'key': 'cat_high_business_corporate',
      'name': 'Business / Corporate',
      'description': '',
      'parentItemCategoryId': 4,
      'updatedAt': 1559113803222,
      'createdAt': 1557916310347,
      'ChildItemCategories': []
    }, {
      'id': 6,
      'key': 'cat_high_vehicles_aircraft_yachts',
      'name': 'Vehicles / Aircraft / Yachts and Water Craft',
      'description': '',
      'parentItemCategoryId': 4,
      'updatedAt': 1559113803263,
      'createdAt': 1557916310375,
      'ChildItemCategories': []
    }, {
      'id': 7,
      'key': 'cat_high_real_estate',
      'name': 'Real Estate',
      'description': '',
      'parentItemCategoryId': 4,
      'updatedAt': 1559113803296,
      'createdAt': 1557916310422,
      'ChildItemCategories': []
    }, {
      'id': 8,
      'key': 'cat_high_luxyry_items',
      'name': 'Luxury Items',
      'description': '',
      'parentItemCategoryId': 4,
      'updatedAt': 1559113803323,
      'createdAt': 1557916310499,
      'ChildItemCategories': []
    }, {
      'id': 9,
      'key': 'cat_high_services',
      'name': 'Services & Other',
      'description': '',
      'parentItemCategoryId': 4,
      'updatedAt': 1559113803369,
      'createdAt': 1557916310523,
      'ChildItemCategories': []
    }]
  }, {
    'id': 10,
    'key': 'cat_housing_travel_vacation',
    'name': 'Housing / Travel & Vacation',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113803401,
    'createdAt': 1557916310561,
    'ChildItemCategories': [{
      'id': 11,
      'key': 'cat_housing_vacation_rentals',
      'name': 'Vacation Rentals',
      'description': '',
      'parentItemCategoryId': 10,
      'updatedAt': 1559113803420,
      'createdAt': 1557916310579,
      'ChildItemCategories': []
    }, {
      'id': 12,
      'key': 'cat_housing_travel_services',
      'name': 'Travel Services',
      'description': '',
      'parentItemCategoryId': 10,
      'updatedAt': 1559113803442,
      'createdAt': 1557916310612,
      'ChildItemCategories': []
    }, {
      'id': 13,
      'key': 'cat_housing_apartments_rental_housing',
      'name': 'Apartments / Rental Housing',
      'description': '',
      'parentItemCategoryId': 10,
      'updatedAt': 1559113803469,
      'createdAt': 1557916310648,
      'ChildItemCategories': []
    }]
  }, {
    'id': 14,
    'key': 'cat_apparel_accessories',
    'name': 'Apparel & Accessories',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113803492,
    'createdAt': 1557916310679,
    'ChildItemCategories': [{
      'id': 15,
      'key': 'cat_apparel_adult',
      'name': 'Adult',
      'description': '',
      'parentItemCategoryId': 14,
      'updatedAt': 1559113803513,
      'createdAt': 1557916310695,
      'ChildItemCategories': []
    }, {
      'id': 16,
      'key': 'cat_apparel_children',
      'name': 'Children',
      'description': '',
      'parentItemCategoryId': 14,
      'updatedAt': 1559113803546,
      'createdAt': 1557916310714,
      'ChildItemCategories': []
    }, {
      'id': 17,
      'key': 'cat_apparel_bags_luggage',
      'name': 'Bags & Luggage',
      'description': '',
      'parentItemCategoryId': 14,
      'updatedAt': 1559113803564,
      'createdAt': 1557916310755,
      'ChildItemCategories': []
    }, {
      'id': 18,
      'key': 'cat_apparel_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 14,
      'updatedAt': 1559113803587,
      'createdAt': 1557916310780,
      'ChildItemCategories': []
    }]
  }, {
    'id': 19,
    'key': 'cat_app_software',
    'name': 'Apps / Software',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113803628,
    'createdAt': 1557916310812,
    'ChildItemCategories': [{
      'id': 20,
      'key': 'cat_app_android',
      'name': 'Android',
      'description': '',
      'parentItemCategoryId': 19,
      'updatedAt': 1559113803646,
      'createdAt': 1557916310828,
      'ChildItemCategories': []
    }, {
      'id': 21,
      'key': 'cat_app_ios',
      'name': 'IOS',
      'description': '',
      'parentItemCategoryId': 19,
      'updatedAt': 1559113803678,
      'createdAt': 1557916310861,
      'ChildItemCategories': []
    }, {
      'id': 22,
      'key': 'cat_app_windows',
      'name': 'Windows',
      'description': '',
      'parentItemCategoryId': 19,
      'updatedAt': 1559113803703,
      'createdAt': 1557916310878,
      'ChildItemCategories': []
    }, {
      'id': 23,
      'key': 'cat_app_mac',
      'name': 'Mac',
      'description': '',
      'parentItemCategoryId': 19,
      'updatedAt': 1559113803718,
      'createdAt': 1557916310904,
      'ChildItemCategories': []
    }, {
      'id': 24,
      'key': 'cat_app_web_development',
      'name': 'Web Development',
      'description': '',
      'parentItemCategoryId': 19,
      'updatedAt': 1559113803735,
      'createdAt': 1557916310927,
      'ChildItemCategories': []
    }, {
      'id': 25,
      'key': 'cat_app_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 19,
      'updatedAt': 1559113803770,
      'createdAt': 1557916310946,
      'ChildItemCategories': []
    }]
  }, {
    'id': 26,
    'key': 'cat_automotive_machinery',
    'name': 'Automotive / Machinery',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113803789,
    'createdAt': 1557916310968,
    'ChildItemCategories': [{
      'id': 27,
      'key': 'cat_auto_cars_truck_parts',
      'name': 'Cars & Truck Parts',
      'description': '',
      'parentItemCategoryId': 26,
      'updatedAt': 1559113803808,
      'createdAt': 1557916310994,
      'ChildItemCategories': []
    }, {
      'id': 28,
      'key': 'cat_auto_motorcycle',
      'name': 'Motorcycle & ATV',
      'description': '',
      'parentItemCategoryId': 26,
      'updatedAt': 1559113803826,
      'createdAt': 1557916311017,
      'ChildItemCategories': []
    }, {
      'id': 29,
      'key': 'cat_auto_rv_boating',
      'name': 'RV & Boating',
      'description': '',
      'parentItemCategoryId': 26,
      'updatedAt': 1559113803856,
      'createdAt': 1557916311045,
      'ChildItemCategories': []
    }, {
      'id': 30,
      'key': 'cat_auto_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 26,
      'updatedAt': 1559113803870,
      'createdAt': 1557916311081,
      'ChildItemCategories': []
    }]
  }, {
    'id': 31,
    'key': 'cat_books_media_music_movies',
    'name': 'Books / Media / Music & Movies',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113803888,
    'createdAt': 1557916311107,
    'ChildItemCategories': [{
      'id': 32,
      'key': 'cat_media_books_art_print',
      'name': 'Books / Art / Print Media',
      'description': '',
      'parentItemCategoryId': 31,
      'updatedAt': 1559113803926,
      'createdAt': 1557916311124,
      'ChildItemCategories': []
    }, {
      'id': 33,
      'key': 'cat_media_music_physical',
      'name': 'Music - Physical',
      'description': '',
      'parentItemCategoryId': 31,
      'updatedAt': 1559113803946,
      'createdAt': 1557916311145,
      'ChildItemCategories': []
    }, {
      'id': 34,
      'key': 'cat_media_music_digital',
      'name': 'Music - Digital downloads',
      'description': '',
      'parentItemCategoryId': 31,
      'updatedAt': 1559113803963,
      'createdAt': 1557916311173,
      'ChildItemCategories': []
    }, {
      'id': 35,
      'key': 'cat_media_movies_entertainment',
      'name': 'Movies and Entertainment',
      'description': '',
      'parentItemCategoryId': 31,
      'updatedAt': 1559113803985,
      'createdAt': 1557916311194,
      'ChildItemCategories': []
    }, {
      'id': 36,
      'key': 'cat_media_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 31,
      'updatedAt': 1559113804004,
      'createdAt': 1557916311226,
      'ChildItemCategories': []
    }]
  }, {
    'id': 37,
    'key': 'cat_cell_phones_mobiles',
    'name': 'Cell phones and Mobile Devices',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113804020,
    'createdAt': 1557916311245,
    'ChildItemCategories': [{
      'id': 38,
      'key': 'cat_mobile_accessories',
      'name': 'Accessories',
      'description': '',
      'parentItemCategoryId': 37,
      'updatedAt': 1559113804039,
      'createdAt': 1557916311258,
      'ChildItemCategories': []
    }, {
      'id': 39,
      'key': 'cat_mobile_cell_phones',
      'name': 'Cell Phones',
      'description': '',
      'parentItemCategoryId': 37,
      'updatedAt': 1559113804063,
      'createdAt': 1557916311305,
      'ChildItemCategories': []
    }, {
      'id': 40,
      'key': 'cat_mobile_tablets',
      'name': 'Tablets',
      'description': '',
      'parentItemCategoryId': 37,
      'updatedAt': 1559113804077,
      'createdAt': 1557916311338,
      'ChildItemCategories': []
    }, {
      'id': 41,
      'key': 'cat_mobile_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 37,
      'updatedAt': 1559113804090,
      'createdAt': 1557916311360,
      'ChildItemCategories': []
    }]
  }, {
    'id': 42,
    'key': 'cat_electronics_and_technology',
    'name': 'Electronics and Technology',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113804111,
    'createdAt': 1557916311378,
    'ChildItemCategories': [{
      'id': 43,
      'key': 'cat_electronics_home_audio',
      'name': 'Home Audio',
      'description': '',
      'parentItemCategoryId': 42,
      'updatedAt': 1559113804133,
      'createdAt': 1557916311406,
      'ChildItemCategories': []
    }, {
      'id': 44,
      'key': 'cat_electronics_music_instruments',
      'name': 'Music Instruments and Gear',
      'description': '',
      'parentItemCategoryId': 42,
      'updatedAt': 1559113804161,
      'createdAt': 1557916311427,
      'ChildItemCategories': []
    }, {
      'id': 45,
      'key': 'cat_electronics_automation_security',
      'name': 'Automation and Security',
      'description': '',
      'parentItemCategoryId': 42,
      'updatedAt': 1559113804174,
      'createdAt': 1557916311468,
      'ChildItemCategories': []
    }, {
      'id': 46,
      'key': 'cat_electronics_video_camera',
      'name': 'Video & Camera',
      'description': '',
      'parentItemCategoryId': 42,
      'updatedAt': 1559113804190,
      'createdAt': 1557916311495,
      'ChildItemCategories': []
    }, {
      'id': 47,
      'key': 'cat_electronics_television_monitors',
      'name': 'Television & Monitors',
      'description': '',
      'parentItemCategoryId': 42,
      'updatedAt': 1559113804216,
      'createdAt': 1557916311520,
      'ChildItemCategories': []
    }, {
      'id': 48,
      'key': 'cat_electronics_computers_parts',
      'name': 'Computer Systems and Parts',
      'description': '',
      'parentItemCategoryId': 42,
      'updatedAt': 1559113804231,
      'createdAt': 1557916311541,
      'ChildItemCategories': []
    }, {
      'id': 49,
      'key': 'cat_electronics_gaming_esports',
      'name': 'Gaming and E-Sports',
      'description': '',
      'parentItemCategoryId': 42,
      'updatedAt': 1559113804248,
      'createdAt': 1557916311576,
      'ChildItemCategories': []
    }, {
      'id': 50,
      'key': 'cat_electronics_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 42,
      'updatedAt': 1559113804264,
      'createdAt': 1557916311603,
      'ChildItemCategories': []
    }]
  }, {
    'id': 51,
    'key': 'cat_health_beauty_personal',
    'name': 'Health / Beauty and Personal Care',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113804280,
    'createdAt': 1557916311646,
    'ChildItemCategories': [{
      'id': 52,
      'key': 'cat_health_diet_nutrition',
      'name': 'Diet & Nutrition',
      'description': '',
      'parentItemCategoryId': 51,
      'updatedAt': 1559113804296,
      'createdAt': 1557916311662,
      'ChildItemCategories': []
    }, {
      'id': 53,
      'key': 'cat_health_personal_care',
      'name': 'Health and Personal Care',
      'description': '',
      'parentItemCategoryId': 51,
      'updatedAt': 1559113804311,
      'createdAt': 1557916311689,
      'ChildItemCategories': []
    }, {
      'id': 54,
      'key': 'cat_health_household_supplies',
      'name': 'Household Supplies',
      'description': '',
      'parentItemCategoryId': 51,
      'updatedAt': 1559113804330,
      'createdAt': 1557916311722,
      'ChildItemCategories': []
    }, {
      'id': 55,
      'key': 'cat_health_beauty_products_jewelry',
      'name': 'Beauty Products and Jewelry',
      'description': '',
      'parentItemCategoryId': 51,
      'updatedAt': 1559113804350,
      'createdAt': 1557916311742,
      'ChildItemCategories': []
    }, {
      'id': 56,
      'key': 'cat_health_baby_infant_care',
      'name': 'Baby / Infant Care and Products',
      'description': '',
      'parentItemCategoryId': 51,
      'updatedAt': 1559113804364,
      'createdAt': 1557916311774,
      'ChildItemCategories': []
    }, {
      'id': 57,
      'key': 'cat_health_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 51,
      'updatedAt': 1559113804385,
      'createdAt': 1557916311794,
      'ChildItemCategories': []
    }]
  }, {
    'id': 58,
    'key': 'cat_home_kitchen',
    'name': 'Home and Kitchen',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113804400,
    'createdAt': 1557916311823,
    'ChildItemCategories': [{
      'id': 59,
      'key': 'cat_home_furniture',
      'name': 'Furniture',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804424,
      'createdAt': 1557916311842,
      'ChildItemCategories': []
    }, {
      'id': 60,
      'key': 'cat_home_appliances_kitchenware',
      'name': 'Appliances and Kitchenware',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804446,
      'createdAt': 1557916311861,
      'ChildItemCategories': []
    }, {
      'id': 61,
      'key': 'cat_home_textiles_rugs_bedding',
      'name': 'Textiles / Rugs & Bedding',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804458,
      'createdAt': 1557916311883,
      'ChildItemCategories': []
    }, {
      'id': 62,
      'key': 'cat_home_hardware_tools',
      'name': 'Hardware and Tools',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804470,
      'createdAt': 1557916311900,
      'ChildItemCategories': []
    }, {
      'id': 63,
      'key': 'cat_home_pet_supplies',
      'name': 'Pet Supplies',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804482,
      'createdAt': 1557916311917,
      'ChildItemCategories': []
    }, {
      'id': 64,
      'key': 'cat_home_home_office',
      'name': 'Home Office Products',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804507,
      'createdAt': 1557916311935,
      'ChildItemCategories': []
    }, {
      'id': 65,
      'key': 'cat_home_sporting_outdoors',
      'name': 'Sporting and Outdoors',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804522,
      'createdAt': 1557916311955,
      'ChildItemCategories': []
    }, {
      'id': 66,
      'key': 'cat_home_specialty_items',
      'name': 'Specialty Items',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804536,
      'createdAt': 1557916311976,
      'ChildItemCategories': []
    }, {
      'id': 67,
      'key': 'cat_home_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 58,
      'updatedAt': 1559113804558,
      'createdAt': 1557916312008,
      'ChildItemCategories': []
    }]
  }, {
    'id': 68,
    'key': 'cat_services_corporate',
    'name': 'Services / Corporate',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113804581,
    'createdAt': 1557916312028,
    'ChildItemCategories': [{
      'id': 69,
      'key': 'cat_services_commercial',
      'name': 'Commercial Services',
      'description': '',
      'parentItemCategoryId': 68,
      'updatedAt': 1559113804595,
      'createdAt': 1557916312042,
      'ChildItemCategories': []
    }, {
      'id': 70,
      'key': 'cat_services_freelance',
      'name': 'Freelance Services',
      'description': '',
      'parentItemCategoryId': 68,
      'updatedAt': 1559113804625,
      'createdAt': 1557916312070,
      'ChildItemCategories': []
    }, {
      'id': 71,
      'key': 'cat_services_labor_talent',
      'name': 'Labor and Talent Services',
      'description': '',
      'parentItemCategoryId': 68,
      'updatedAt': 1559113804647,
      'createdAt': 1557916312114,
      'ChildItemCategories': []
    }, {
      'id': 72,
      'key': 'cat_services_transport_logistics',
      'name': 'Transport Logistics and Trucking',
      'description': '',
      'parentItemCategoryId': 68,
      'updatedAt': 1559113804662,
      'createdAt': 1557916312141,
      'ChildItemCategories': []
    }, {
      'id': 73,
      'key': 'cat_services_escrow',
      'name': 'Escrow Services',
      'description': '',
      'parentItemCategoryId': 68,
      'updatedAt': 1559113804684,
      'createdAt': 1557916312166,
      'ChildItemCategories': []
    }, {
      'id': 74,
      'key': 'cat_services_endoflife_estate_inheritance',
      'name': 'End of life, Estate & Inheritence Services',
      'description': '',
      'parentItemCategoryId': 68,
      'updatedAt': 1559113804703,
      'createdAt': 1557916312192,
      'ChildItemCategories': []
    }, {
      'id': 75,
      'key': 'cat_services_legal_admin',
      'name': 'Legal & Admin Services',
      'description': '',
      'parentItemCategoryId': 68,
      'updatedAt': 1559113804716,
      'createdAt': 1557916312218,
      'ChildItemCategories': []
    }, {
      'id': 76,
      'key': 'cat_services_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 68,
      'updatedAt': 1559113804746,
      'createdAt': 1557916312245,
      'ChildItemCategories': []
    }]
  }, {
    'id': 77,
    'key': 'cat_wholesale_science_industrial',
    'name': 'Wholesale / Science & Industrial Products',
    'description': '',
    'parentItemCategoryId': 1,
    'updatedAt': 1559113804758,
    'createdAt': 1557916312260,
    'ChildItemCategories': [{
      'id': 78,
      'key': 'cat_wholesale_consumer_goods',
      'name': 'Wholesale Consumer Goods',
      'description': '',
      'parentItemCategoryId': 77,
      'updatedAt': 1559113804770,
      'createdAt': 1557916312274,
      'ChildItemCategories': []
    }, {
      'id': 79,
      'key': 'cat_wholesale_commercial_industrial',
      'name': 'Wholesale Commercial / Industrial Goods',
      'description': '',
      'parentItemCategoryId': 77,
      'updatedAt': 1559113804784,
      'createdAt': 1557916312292,
      'ChildItemCategories': []
    }, {
      'id': 80,
      'key': 'cat_wholesale_scientific_equipment_supplies',
      'name': 'Scientific Equipment and Supplies',
      'description': '',
      'parentItemCategoryId': 77,
      'updatedAt': 1559113804798,
      'createdAt': 1557916312311,
      'ChildItemCategories': []
    }, {
      'id': 81,
      'key': 'cat_wholesale_scientific_lab_services',
      'name': 'Scientific / Lab Services',
      'description': '',
      'parentItemCategoryId': 77,
      'updatedAt': 1559113804814,
      'createdAt': 1557916312329,
      'ChildItemCategories': []
    }, {
      'id': 82,
      'key': 'cat_wholesale_other',
      'name': 'Other',
      'description': '',
      'parentItemCategoryId': 77,
      'updatedAt': 1559113804829,
      'createdAt': 1557916312346,
      'ChildItemCategories': []
    }]
  }]
}]

export {
  categories
};
