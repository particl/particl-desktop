import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Log, Level } from 'ng2-logger';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  Log.setProductionMode();  // disables logging
  enableProdMode();
}

if (environment.envName === 'dev') {
  // TODO: dev env logging config, see https://github.com/darekf77/ng2-logger
  Log.onlyModules('(.*?)');
  // Comment out to see debug messages
  // Log.onlyLevel(Level.ERROR, Level.INFO, Level.WARN);
}

const log: any = Log.create('main');

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(success => log.d('Ready. (env: ' + environment.envName + ')'))
  .catch(err => console.error(err));
