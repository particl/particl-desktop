const _options    = require('../options');
const market    = require('particl-marketplace');
// require('../../node_modules/particl-market/dist/core/App.js');

exports.init = function() {
  const options = _options.get();

  if (!options.skipmarket) {
    // market.startMarket();
    market.initialize().then((result) => {
      console.log("particl-market initialized: ", result);
      market.createDefaultEnvFile().then((env) => {
        console.log("particl-market env created?: ", env);

        market.migrate().then(() => {
          console.log('Migration done');
          // TODO: this ugly hack starts the particl-market
          const t = require('particl-marketplace/dist/app.js');
        });

      });
    });

  }
}

// TODO: Export startup function..