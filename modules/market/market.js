const _options    = require('../options');

exports.init = function() {
  const options = _options.get();

  if (!options.skipmarket) {
    const mp = require('../../particl-market/dist/app');
  }
}

// TODO: Export startup function..