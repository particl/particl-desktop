const _     = require('lodash');
const rxIpc = require('rx-ipc-electron/lib/main').default;
const Observable = require('rxjs/Observable').Observable;

const particl_market_import_core = require('particl-market-import-core');
const Transformers = particl_market_import_core.Transformers;
const ListingManager = particl_market_import_core.ListingManager;

const importConfig = [];
const importers = {};

exports.init = function() {

	for (const t of Transformers){
		const transformer = new t;
    const config = transformer.getImportParams();
    importConfig.push(config);
    importers[config.id] = transformer;
  }

  rxIpc.registerListener('importer-config', () => getImportConfig());
  rxIpc.registerListener('importer-load', importLoad);
  rxIpc.registerListener('importer-validate', validateListings);
  rxIpc.registerListener('importer-publish', publishListings);

}

exports.destroy = function() {
    rxIpc.removeListeners('importer-config');
    rxIpc.removeListeners('importer-load');
    rxIpc.removeListeners('importer-validate');
    rxIpc.removeListeners('importer-publish');
}


function getImportConfig() {
  return Observable.create(observer => {
    observer.next(importConfig);
    observer.complete(true);
  });
}

function importLoad(data) {
  const selectedImport = importers[data.id];

  const params = {};
  for (const param of data.params) {
    params[param.name] = param.value;
  }

  return selectedImport.load(params);
}

function validateListings(listings, country, expTime) {
  return ListingManager.validate(listings, country, expTime);
}

function publishListings(listings, country, expTime) {
  return ListingManager.publish(listings, country, expTime);
}
