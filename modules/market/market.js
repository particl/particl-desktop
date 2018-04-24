const _options    = require('../options');

exports.init = function() {
  const options = _options.get();

  if (!options.skipmarket) {
    const datadir = require('../../particl-market/dist/core/helpers/DataDir');
    console.log("particl-market: ", datadir.DataDir.getDataDirPath());
    datadir.DataDir.initialize().then((result) => {
      console.log("particl-market initialized: ", result);
      datadir.DataDir.createDefaultEnvFile().then((env) => {
        console.log("particl-market env created?: ", env);

        const migrate = require('../../particl-market/dist/database/migrate');
        migrate.migrate().then(
          console.log('Migration done')
        );
        
        const mp = require ('../../particl-market/dist/app');
      });
    })

  }
}

// TODO: Export startup function..